#!/usr/bin/env node
const readline = require('readline');
const store = require('./store');
const mcp = require('./mcp_handler');

const key = (process.env.TERM_MCP_KEY || process.argv[2] || '').trim();
const resolvedUser = key ? (store.findUserByKey(key) || store.findUserByMcpToken(key)) : 'default';
const mcpPerms = key && key.startsWith('mcp_') ? store.getMcpTokenPermissions(key) : null;

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }) + '\n');
    return;
  }
  if (!resolvedUser) {
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg?.id ?? null, error: { code: -32001, message: 'Unauthorized: invalid or disabled MCP key' } }) + '\n');
    return;
  }
  const resp = await mcp.handleRpc(resolvedUser, msg, null, null, mcpPerms);
  if (resp) process.stdout.write(JSON.stringify(resp) + '\n');
});
