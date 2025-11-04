/**
 * FHIR Request Library
 *
 * Import this in request.ts files to execute FHIR requests with automatic logging
 */

import * as fs from 'fs';
import * as path from 'path';

export interface FHIRConfig {
  name: string;
  fhirBaseUrl: string;
  accessToken?: string;
  mode: string;
}

export interface RequestSpec {
  method: string;
  path: string;
  bodyFile?: string;
  headers?: Record<string, string>;
  purpose: string;
  configName?: string;
  callerDir?: string; // Pass import.meta.dir from the calling request.ts
}

export async function execute(spec: RequestSpec) {
  // Find project root
  let projectRoot = process.cwd();
  while (!fs.existsSync(path.join(projectRoot, '.fhir-configs'))) {
    const parent = path.dirname(projectRoot);
    if (parent === projectRoot) {
      throw new Error('Could not find .fhir-configs directory');
    }
    projectRoot = parent;
  }

  // Load config
  let config: FHIRConfig;
  const configsDir = path.join(projectRoot, '.fhir-configs');

  if (spec.configName) {
    // Explicitly specified config
    const configPath = path.join(configsDir, `${spec.configName}.json`);
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config "${spec.configName}" not found at ${configPath}`);
    }
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } else {
    // No config specified - check how many exist
    const configFiles = fs.readdirSync(configsDir).filter(f => f.endsWith('.json'));

    if (configFiles.length === 0) {
      throw new Error(
        'No FHIR configs found in .fhir-configs/\n' +
        'Run the setup script to create a configuration:\n' +
        '  bun .claude/skills/fhir-connectathon-notes/assets/config/setup.ts'
      );
    }

    if (configFiles.length > 1) {
      // Multiple configs exist - require explicit selection
      const configNames = configFiles.map(f => f.replace('.json', '')).join(', ');
      throw new Error(
        `Multiple FHIR configs found: ${configNames}\n` +
        'Please specify which config to use by adding configName to execute():\n\n' +
        '  await execute({\n' +
        '    ...,\n' +
        '    configName: "your-config-name",\n' +
        '    ...\n' +
        '  });\n'
      );
    }

    // Exactly one config exists - use it automatically
    const configPath = path.join(configsDir, configFiles[0]);
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log(`Auto-selected the only available config: ${config.name}`);
  }

  console.log(`Using config: ${config.name}`);

  // Build URL
  const url = `${config.fhirBaseUrl}${spec.path}`;

  // Build headers
  const headers: Record<string, string> = {
    'Accept': 'application/fhir+json',
    ...(spec.headers || {}),
  };

  if (config.accessToken && config.mode !== 'open') {
    headers['Authorization'] = `Bearer ${config.accessToken}`;
  }

  // Load request body if specified
  let requestBody: any = null;
  if (spec.bodyFile) {
    const bodyPath = path.isAbsolute(spec.bodyFile)
      ? spec.bodyFile
      : path.join(projectRoot, spec.bodyFile);
    requestBody = JSON.parse(fs.readFileSync(bodyPath, 'utf-8'));
    headers['Content-Type'] = 'application/fhir+json';
  }

  // Make request
  console.log(`${spec.method} ${url}`);
  const requestTime = Date.now();

  const response = await fetch(url, {
    method: spec.method,
    headers,
    body: requestBody ? JSON.stringify(requestBody) : undefined,
  });

  const responseTime = Date.now();
  const responseBody = await response.text();

  // Parse response
  let responseJson: any = null;
  let responseExt = 'txt';
  try {
    responseJson = JSON.parse(responseBody);
    responseExt = 'json';
  } catch (e) {
    // Non-JSON response
  }

  // Write response metadata
  const responseMetadata = {
    timestamp: new Date(responseTime).toISOString(),
    httpStatus: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    timing: {
      requestSentAt: new Date(requestTime).toISOString(),
      responseReceivedAt: new Date(responseTime).toISOString(),
      durationMs: responseTime - requestTime,
    },
  };

  // Determine output directory - use caller's dir if provided, otherwise CWD
  const outputDir = spec.callerDir || process.cwd();

  fs.writeFileSync(
    path.join(outputDir, 'response-metadata.json'),
    JSON.stringify(responseMetadata, null, 2)
  );

  // Write response body
  fs.writeFileSync(
    path.join(outputDir, `response-body.${responseExt}`),
    responseJson ? JSON.stringify(responseJson, null, 2) : responseBody
  );

  // Print summary
  console.log(`\n✓ Response saved`);
  console.log(`  Status: ${response.status} ${response.statusText}`);
  console.log(`  Duration: ${responseTime - requestTime}ms`);
  console.log(`  Files: response-metadata.json, response-body.${responseExt}`);

  if (responseJson?.id) {
    console.log(`  Resource ID: ${responseJson.id}`);
  }

  if (response.headers.get('location')) {
    console.log(`  Location: ${response.headers.get('location')}`);
  }

  // Exit with error if 4xx/5xx
  if (response.status >= 400) {
    console.error('\nError response received');
    process.exit(1);
  }
}
