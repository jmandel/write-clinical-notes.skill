#!/usr/bin/env bun

/**
 * SMART on FHIR Setup Button Script
 *
 * This script starts a local web server to help configure SMART on FHIR connections.
 * It supports multiple authentication modes and saves configuration to disk.
 *
 * Run with: bun setup.ts
 */

import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

// Bun provides import.meta.dir directly
const __dirname = import.meta.dir;

// Find project root by looking for .claude directory
function findProjectRoot(startDir: string): string {
  let currentDir = startDir;
  while (currentDir !== path.dirname(currentDir)) { // Stop at filesystem root
    const claudeDir = path.join(currentDir, '.claude');
    if (fs.existsSync(claudeDir) && fs.statSync(claudeDir).isDirectory()) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  // Fallback to cwd if .claude not found
  return process.cwd();
}

const PORT = 3456;
const PROJECT_ROOT = findProjectRoot(__dirname);
const CONFIG_DIR = path.join(PROJECT_ROOT, '.fhir-configs');

// Ensure config directory exists
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// Read the HTML page
const authHtmlPath = path.join(__dirname, 'auth.html');
const HTML_PAGE = fs.readFileSync(authHtmlPath, 'utf-8');

// Simple server
const server = http.createServer((req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // List configs endpoint
  if (req.url === '/list-configs' && req.method === 'GET') {
    try {
      const files = fs.readdirSync(CONFIG_DIR).filter(f => f.endsWith('.json'));
      const configs = files.map(file => {
        const content = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, file), 'utf-8'));
        return {
          name: file.replace('.json', ''),
          ...content
        };
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(configs));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Save config endpoint
  if (req.url === '/save-config' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const config = JSON.parse(body);

        // Validate required fields
        if (!config.fhirBaseUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'fhirBaseUrl is required' }));
          return;
        }

        if (!config.name) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'config name is required' }));
          return;
        }

        // Add timestamp
        config.savedAt = new Date().toISOString();

        // Save to named file in config directory
        const configFile = path.join(CONFIG_DIR, `${config.name}.json`);
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

        console.log('\n✅ Configuration saved to:', configFile);
        console.log('\nConfiguration details:');
        console.log('  Name:', config.name);
        console.log('  FHIR Base URL:', config.fhirBaseUrl);
        console.log('  Mode:', config.mode || 'unknown');
        console.log('  Patient ID:', config.patientId || 'not set');
        console.log('  Has Access Token:', config.accessToken ? 'Yes' : 'No');

        // Output selected config name for agent to read
        console.log('\n📋 SELECTED_CONFIG:', config.name);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, file: configFile, configName: config.name }));

        // Schedule shutdown
        setTimeout(() => {
          console.log('\n🎉 Setup complete! Shutting down server...\n');
          process.exit(0);
        }, 1000);

      } catch (err) {
        console.error('Error saving config:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });

    return;
  }

  // Select config endpoint
  if (req.url === '/select-config' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { name } = JSON.parse(body);
        const configFile = path.join(CONFIG_DIR, `${name}.json`);

        if (!fs.existsSync(configFile)) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Config not found' }));
          return;
        }

        const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

        console.log('\n✅ Configuration selected:', name);
        console.log('\nConfiguration details:');
        console.log('  FHIR Base URL:', config.fhirBaseUrl);
        console.log('  Mode:', config.mode || 'unknown');
        console.log('  Patient ID:', config.patientId || 'not set');

        // Output selected config name for agent to read
        console.log('\n📋 SELECTED_CONFIG:', name);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, configName: name }));

        // Schedule shutdown
        setTimeout(() => {
          console.log('\n🎉 Configuration selected! Shutting down server...\n');
          process.exit(0);
        }, 1000);

      } catch (err) {
        console.error('Error selecting config:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });

    return;
  }

  // Delete config endpoint
  if (req.url === '/delete-config' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { name } = JSON.parse(body);
        const configFile = path.join(CONFIG_DIR, `${name}.json`);

        if (!fs.existsSync(configFile)) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Config not found' }));
          return;
        }

        fs.unlinkSync(configFile);

        console.log('\n🗑️  Configuration deleted:', name);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));

      } catch (err) {
        console.error('Error deleting config:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });

    return;
  }

  // Shutdown endpoint
  if (req.url === '/shutdown' && req.method === 'POST') {
    res.writeHead(200);
    res.end('OK');
    setTimeout(() => process.exit(0), 500);
    return;
  }

  // Serve main page
  if (req.url === '/' || req.url?.startsWith('/?')) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML_PAGE);
    return;
  }

  // 404
  res.writeHead(404);
  res.end('Not Found');
});

// Start server
server.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║          🏥 FHIR SMART on FHIR Setup Server Started 🏥         ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  console.log('  📡 Server running at: \x1b[36m\x1b[4mhttp://localhost:' + PORT + '\x1b[0m\n');
  console.log('  👉 Click the link above to open in your browser\n');
  console.log('  ℹ️  This server will help you:');
  console.log('     • Connect to a SMART on FHIR server');
  console.log('     • Obtain access tokens via OAuth');
  console.log('     • Or paste an existing token');
  console.log('     • Save configuration for the agent to use\n');
  console.log('  ⏹️  The server will automatically shut down after setup\n');
  console.log('────────────────────────────────────────────────────────────────\n');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Server stopped by user\n');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Server stopped\n');
  process.exit(0);
});
