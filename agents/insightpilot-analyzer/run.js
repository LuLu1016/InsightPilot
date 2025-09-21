// Minimal MCP client placeholder for Coral integration
// This file should connect to CORAL_CONNECTION_URL and register tools.
// For MVP, we log envs to verify Coral injected options correctly and write a proof file.
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

function main() {
  const required = ['MISTRAL_API_KEY'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error('[MCP-Agent] Missing required envs:', missing.join(','));
    process.exit(1);
  }

  try {
    const proof = {
      timestamp: new Date().toISOString(),
      env: {
        CORAL_CONNECTION_URL: process.env.CORAL_CONNECTION_URL || '',
        CORAL_AGENT_ID: process.env.CORAL_AGENT_ID || '',
        CORAL_SESSION_ID: process.env.CORAL_SESSION_ID || ''
      }
    };
    const outPath = path.join(__dirname, 'last-run.txt');
    fs.writeFileSync(outPath, JSON.stringify(proof, null, 2), 'utf8');
    console.log('[MCP-Agent] wrote proof file:', outPath);
  } catch (e) {
    console.warn('[MCP-Agent] failed to write proof file:', e.message);
  }

  console.log('[MCP-Agent] Starting with envs:');
  console.log(' MISTRAL_API_KEY:', (process.env.MISTRAL_API_KEY || '').slice(0, 6) + '...');
  if (process.env.ELEVENLABS_API_KEY) console.log(' ELEVENLABS_API_KEY: set');
  if (process.env.CROSSMINT_PROJECT_ID) console.log(' CROSSMINT_PROJECT_ID: set');
  if (process.env.CROSSMINT_CLIENT_SECRET) console.log(' CROSSMINT_CLIENT_SECRET: set');

  console.log('[MCP-Agent] CORAL envs:');
  console.log(' CORAL_CONNECTION_URL:', process.env.CORAL_CONNECTION_URL || '');
  console.log(' CORAL_AGENT_ID:', process.env.CORAL_AGENT_ID || '');
  console.log(' CORAL_SESSION_ID:', process.env.CORAL_SESSION_ID || '');

  const connUrl = process.env.CORAL_CONNECTION_URL;
  if (connUrl) {
    try {
      const outConn = path.join(__dirname, 'mcp-conn.txt');
      const outEvents = path.join(__dirname, 'mcp-events.log');
      const client = connUrl.startsWith('https') ? https : http;
      const req = client.get(connUrl, {
        headers: {
          Accept: 'text/event-stream',
          Connection: 'keep-alive'
        },
      }, (res) => {
        const ok = res.statusCode === 200;
        const info = {
          timestamp: new Date().toISOString(),
          statusCode: res.statusCode,
          connected: ok,
          headers: res.headers
        };
        try { fs.writeFileSync(outConn, JSON.stringify(info, null, 2), 'utf8'); } catch {}
        console.log('[MCP-Agent] SSE status:', res.statusCode);

        let buffer = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          buffer += chunk;
          const parts = buffer.split('\n\n');
          buffer = parts.pop();
          for (const part of parts) {
            try { fs.appendFileSync(outEvents, part + '\n\n', 'utf8'); } catch {}
          }
        });
        res.on('end', () => {
          console.log('[MCP-Agent] SSE stream ended');
        });
      });
      req.on('error', (err) => {
        console.warn('[MCP-Agent] SSE error:', err.message);
        try {
          fs.writeFileSync(outConn, JSON.stringify({
            timestamp: new Date().toISOString(),
            connected: false,
            error: err.message
          }, null, 2), 'utf8');
        } catch {}
      });
      req.setTimeout(30000, () => {
        console.warn('[MCP-Agent] SSE timeout');
      });
    } catch (e) {
      console.warn('[MCP-Agent] Failed to open SSE:', e.message);
    }
  } else {
    console.warn('[MCP-Agent] No CORAL_CONNECTION_URL provided; skipping SSE connect');
  }

  // TODO: implement MCP protocol client to connect and register tools
  setInterval(() => {
    console.log('[MCP-Agent] heartbeat');
  }, 5000);
}

main();


