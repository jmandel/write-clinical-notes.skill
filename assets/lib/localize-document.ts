#!/usr/bin/env bun

/**
 * Localize a DocumentReference template with patient-specific data
 *
 * Usage:
 *   bun localize-document.ts --type=pdf --patient-id=123 --server=smart
 *   bun localize-document.ts --type=html --patient-id=abc --patient-name="John Doe" --server=epic
 *
 * Available types:
 *   - plaintext (progress note)
 *   - pdf
 *   - cda (proper C-CDA XML)
 *   - xhtml (XHTML rich text)
 *   - html (HTML rich text)
 *   - large (5+ MiB test)
 *   - patient-asserted
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { parseArgs } from 'util';

interface LocalizationOptions {
  type: string;
  patientId: string;
  patientName?: string;
  authorReference?: string;
  authorDisplay?: string;
  encounterReference?: string;
  encounterDisplay?: string;
  identifierSystem?: string;
  server: string;
  outputDir?: string;
}

interface TemplateMapping {
  template: string;
  contentFile?: string;
  contentGenerator?: string;
  contentType: string;
  noteType: string;
}

const TEMPLATE_MAPPINGS: Record<string, TemplateMapping> = {
  plaintext: {
    template: 'progress-note.json',
    contentFile: 'progress-note.txt',
    contentType: 'text/plain; charset=utf-8',
    noteType: 'Progress note'
  },
  pdf: {
    template: 'consultation-note-pdf.json',
    contentGenerator: 'generate-pdf.ts',
    contentType: 'application/pdf',
    noteType: 'Consultation note'
  },
  cda: {
    template: 'discharge-summary-cda-xml.json',
    contentGenerator: 'generate-cda-xml.ts',
    contentType: 'application/cda+xml',
    noteType: 'Discharge summary'
  },
  xhtml: {
    template: 'discharge-summary-xhtml.json',
    contentGenerator: 'generate-xhtml.ts',
    contentType: 'application/xhtml+xml',
    noteType: 'Discharge summary'
  },
  html: {
    template: 'progress-note-html.json',
    contentGenerator: 'generate-html.ts',
    contentType: 'text/html; charset=utf-8',
    noteType: 'Progress note'
  },
  large: {
    template: 'large-note.json',
    contentGenerator: 'generate-large-file.ts',
    contentType: 'text/plain; charset=utf-8',
    noteType: 'Summary of episode note'
  },
  'patient-asserted': {
    template: 'patient-asserted-note.json',
    contentFile: 'patient-log.txt',
    contentType: 'text/plain; charset=utf-8',
    noteType: 'Progress note'
  }
};

function getProjectRoot(): string {
  // Walk up from current directory to find project root
  let dir = process.cwd();
  while (dir !== '/') {
    if (existsSync(resolve(dir, '.fhir-configs'))) {
      return dir;
    }
    dir = dirname(dir);
  }
  throw new Error('Could not find project root (no .fhir-configs directory found)');
}

function getSkillRoot(): string {
  const projectRoot = getProjectRoot();
  return resolve(projectRoot, '.claude/skills/fhir-connectathon-notes');
}

function replaceContentPlaceholders(content: string, options: LocalizationOptions): string {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // 2025-01-15
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // 14:30
  const currentTimestamp = now.toISOString();
  const currentTimestampCDA = now.toISOString().replace(/[-:]/g, '').split('.')[0] + '-0500'; // 20250115T143000-0500

  // Parse patient name into given/family if provided
  const patientName = options.patientName || 'Test Patient';
  const [patientGiven = 'Test', patientFamily = 'Patient'] = patientName.split(' ');

  // Parse author name
  const authorDisplay = options.authorDisplay || 'Dr. Example Provider';
  const authorParts = authorDisplay.replace(/^Dr\.\s*/, '').split(' ');
  const authorGiven = authorParts[0] || 'Example';
  const authorFamily = authorParts[authorParts.length - 1] || 'Provider';
  const authorSuffix = authorDisplay.includes('MD') ? 'MD' : '';

  return content
    .replace(/\{\{PATIENT_NAME\}\}/g, patientName)
    .replace(/\{\{PATIENT_ID\}\}/g, options.patientId)
    .replace(/\{\{PATIENT_GIVEN_NAME\}\}/g, patientGiven)
    .replace(/\{\{PATIENT_FAMILY_NAME\}\}/g, patientFamily)
    .replace(/\{\{AUTHOR_NAME\}\}/g, authorDisplay)
    .replace(/\{\{AUTHOR_GIVEN_NAME\}\}/g, authorGiven)
    .replace(/\{\{AUTHOR_FAMILY_NAME\}\}/g, authorFamily)
    .replace(/\{\{AUTHOR_SUFFIX\}\}/g, authorSuffix)
    .replace(/\{\{AUTHOR_TITLE\}\}/g, authorSuffix || 'MD')
    .replace(/\{\{CURRENT_DATE\}\}/g, currentDate)
    .replace(/\{\{CURRENT_TIME\}\}/g, currentTime)
    .replace(/\{\{CURRENT_TIMESTAMP\}\}/g, currentTimestamp)
    .replace(/\{\{CURRENT_TIMESTAMP_CDA\}\}/g, currentTimestampCDA);
}

async function generateContent(
  generator: string,
  options: LocalizationOptions
): Promise<{ content: Buffer; filename: string }> {
  const skillRoot = getSkillRoot();
  const generatorPath = resolve(skillRoot, 'assets/sample-content', generator);

  if (!existsSync(generatorPath)) {
    throw new Error(`Generator not found: ${generatorPath}`);
  }

  // Import and run the generator
  const cwd = process.cwd();
  const tempDir = resolve(skillRoot, 'assets/sample-content');

  try {
    process.chdir(tempDir);
    await import(generatorPath);

    // Determine output filename based on generator
    const outputMap: Record<string, string> = {
      'generate-pdf.ts': 'consultation-note.pdf',
      'generate-cda-xml.ts': 'discharge-summary.cda.xml',
      'generate-xhtml.ts': 'discharge-summary.xhtml',
      'generate-html.ts': 'progress-note.html',
      'generate-large-file.ts': 'large-note.txt'
    };

    const filename = outputMap[generator];
    if (!filename) {
      throw new Error(`Unknown generator: ${generator}`);
    }

    const contentPath = resolve(tempDir, filename);
    if (!existsSync(contentPath)) {
      throw new Error(`Generator did not create expected file: ${filename}`);
    }

    // Read content and replace placeholders
    let contentText = readFileSync(contentPath, 'utf-8');
    contentText = replaceContentPlaceholders(contentText, options);
    const content = Buffer.from(contentText, 'utf-8');

    return { content, filename };
  } finally {
    process.chdir(cwd);
  }
}

function getContentFile(
  filename: string,
  options: LocalizationOptions
): { content: Buffer; filename: string } {
  const skillRoot = getSkillRoot();
  const contentPath = resolve(skillRoot, 'assets/sample-content', filename);

  if (!existsSync(contentPath)) {
    throw new Error(`Content file not found: ${contentPath}`);
  }

  // Read content and replace placeholders
  let contentText = readFileSync(contentPath, 'utf-8');
  contentText = replaceContentPlaceholders(contentText, options);
  const content = Buffer.from(contentText, 'utf-8');

  return { content, filename };
}

function localizeTemplate(
  templateContent: string,
  options: LocalizationOptions,
  base64Content: string,
  contentSize: number,
  contentType: string
): string {
  const timestamp = new Date().toISOString();
  const identifierValue = `${options.type}-${Date.now()}`;

  // Default values
  const patientName = options.patientName || 'Test Patient';
  const authorReference = options.authorReference || 'Practitioner/example';
  const authorDisplay = options.authorDisplay || 'Dr. Example Provider';
  const encounterReference = options.encounterReference || '#e1';
  const encounterDisplay = options.encounterDisplay || 'Office Visit';
  const identifierSystem = options.identifierSystem || 'https://example.com/fhir-test';

  // Replace all placeholders
  let localized = templateContent
    .replace(/\{\{IDENTIFIER_SYSTEM\}\}/g, identifierSystem)
    .replace(/\{\{IDENTIFIER_VALUE\}\}/g, identifierValue)
    .replace(/\{\{PATIENT_ID\}\}/g, options.patientId)
    .replace(/\{\{PATIENT_NAME\}\}/g, patientName)
    .replace(/\{\{AUTHOR_REFERENCE\}\}/g, authorReference)
    .replace(/\{\{AUTHOR_DISPLAY\}\}/g, authorDisplay)
    .replace(/\{\{ENCOUNTER_REFERENCE\}\}/g, encounterReference)
    .replace(/\{\{ENCOUNTER_DISPLAY\}\}/g, encounterDisplay)
    .replace(/\{\{ENCOUNTER_IDENTIFIER_SYSTEM\}\}/g, identifierSystem + '/encounters')
    .replace(/\{\{ENCOUNTER_IDENTIFIER_VALUE\}\}/g, `enc-${Date.now()}`)
    .replace(/\{\{ENCOUNTER_START\}\}/g, '2025-01-15T08:00:00Z')
    .replace(/\{\{ENCOUNTER_END\}\}/g, '2025-01-15T09:00:00Z')
    .replace(/\{\{CURRENT_TIMESTAMP\}\}/g, timestamp)
    .replace(/\{\{PERIOD_START\}\}/g, '2025-01-15T08:00:00Z')
    .replace(/\{\{PERIOD_END\}\}/g, '2025-01-15T09:00:00Z')
    .replace(/\{\{CONTENT_TYPE\}\}/g, contentType)
    .replace(/\{\{BASE64_CONTENT\}\}/g, base64Content)
    .replace(/\{\{CONTENT_SIZE\}\}/g, contentSize.toString())
    .replace(/\{\{APP_NAME\}\}/g, 'FHIR Test App');

  // Parse to ensure it's valid JSON
  const parsed = JSON.parse(localized);

  // Add contained encounter if using #e1 reference
  if (encounterReference === '#e1' && !parsed.contained) {
    parsed.contained = [{
      resourceType: 'Encounter',
      id: 'e1',
      status: 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB'
      },
      subject: {
        reference: `Patient/${options.patientId}`
      },
      period: {
        start: '2025-01-15T08:00:00Z',
        end: '2025-01-15T09:00:00Z'
      }
    }];
  }

  return JSON.stringify(parsed, null, 2);
}

async function main() {
  const { values } = parseArgs({
    options: {
      type: { type: 'string', short: 't' },
      'patient-id': { type: 'string', short: 'p' },
      'patient-name': { type: 'string' },
      'author-reference': { type: 'string' },
      'author-display': { type: 'string' },
      'encounter-reference': { type: 'string' },
      'encounter-display': { type: 'string' },
      'identifier-system': { type: 'string' },
      server: { type: 'string', short: 's' },
      'output-dir': { type: 'string', short: 'o' },
      help: { type: 'boolean', short: 'h' }
    }
  });

  if (values.help) {
    console.log(`
Usage: bun localize-document.ts [options]

Options:
  -t, --type <type>              Document type (required)
                                 Types: plaintext, pdf, cda, xhtml, html, large, patient-asserted
  -p, --patient-id <id>          Patient ID (required)
  -s, --server <name>            Server name for output directory (required)
  --patient-name <name>          Patient display name (default: "Test Patient")
  --author-reference <ref>       Author reference (default: "Practitioner/example")
  --author-display <name>        Author display name (default: "Dr. Example Provider")
  --encounter-reference <ref>    Encounter reference (default: "#e1" for contained)
  --encounter-display <text>     Encounter display text (default: "Office Visit")
  --identifier-system <system>   Identifier system (default: "https://example.com/fhir-test")
  -o, --output-dir <dir>         Output directory (default: localized/<server>)
  -h, --help                     Show this help

Examples:
  bun localize-document.ts -t pdf -p patient-123 -s smart
  bun localize-document.ts -t html -p abc --patient-name "John Doe" -s epic
  bun localize-document.ts -t cda -p 123 -s smart --author-reference "Practitioner/dr-smith"
`);
    process.exit(0);
  }

  // Validate required options
  if (!values.type || !values['patient-id'] || !values.server) {
    console.error('Error: --type, --patient-id, and --server are required');
    console.error('Run with --help for usage information');
    process.exit(1);
  }

  const type = values.type as string;
  if (!TEMPLATE_MAPPINGS[type]) {
    console.error(`Error: Unknown type "${type}"`);
    console.error(`Available types: ${Object.keys(TEMPLATE_MAPPINGS).join(', ')}`);
    process.exit(1);
  }

  const options: LocalizationOptions = {
    type,
    patientId: values['patient-id'] as string,
    patientName: values['patient-name'] as string | undefined,
    authorReference: values['author-reference'] as string | undefined,
    authorDisplay: values['author-display'] as string | undefined,
    encounterReference: values['encounter-reference'] as string | undefined,
    encounterDisplay: values['encounter-display'] as string | undefined,
    identifierSystem: values['identifier-system'] as string | undefined,
    server: values.server as string,
    outputDir: values['output-dir'] as string | undefined
  };

  try {
    const projectRoot = getProjectRoot();
    const skillRoot = getSkillRoot();
    const mapping = TEMPLATE_MAPPINGS[type];

    console.log(`Localizing ${mapping.noteType} (${mapping.contentType})...`);

    // Get or generate content
    let contentData: { content: Buffer; filename: string };
    if (mapping.contentGenerator) {
      console.log(`  Generating content using ${mapping.contentGenerator}...`);
      contentData = await generateContent(mapping.contentGenerator, options);
    } else if (mapping.contentFile) {
      console.log(`  Reading content from ${mapping.contentFile}...`);
      contentData = getContentFile(mapping.contentFile, options);
    } else {
      throw new Error('No content source specified in mapping');
    }

    // Base64 encode content
    const base64Content = contentData.content.toString('base64');
    const contentSize = contentData.content.length;

    console.log(`  Content: ${(contentSize / 1024).toFixed(2)} KB`);

    // Read and localize template
    const templatePath = resolve(skillRoot, 'assets/templates', mapping.template);
    const templateContent = readFileSync(templatePath, 'utf-8');

    const localizedJson = localizeTemplate(
      templateContent,
      options,
      base64Content,
      contentSize,
      mapping.contentType
    );

    // Determine output directory and filename
    const outputDir = options.outputDir || resolve(projectRoot, 'localized', options.server);
    mkdirSync(outputDir, { recursive: true });

    const outputFilename = `${type}-note.json`;
    const outputPath = resolve(outputDir, outputFilename);

    // Write localized document
    writeFileSync(outputPath, localizedJson);

    console.log(`\n✓ Localized DocumentReference saved to:`);
    console.log(`  ${outputPath}`);
    console.log(`\n  Document details:`);
    console.log(`    Type: ${mapping.noteType}`);
    console.log(`    Content-Type: ${mapping.contentType}`);
    console.log(`    Patient: ${options.patientId}`);
    console.log(`    Size: ${contentSize} bytes (${(contentSize / 1024).toFixed(2)} KB)`);
    console.log(`    Base64 length: ${base64Content.length} chars`);

  } catch (error) {
    console.error(`\nError: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
