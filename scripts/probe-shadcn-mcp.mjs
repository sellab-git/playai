import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const client = new Client({ name: 'playai-registry-check', version: '1.0.0' });
const transport = new StdioClientTransport({ command: process.execPath, args: ['node_modules/shadcn/dist/index.js', 'mcp', '--cwd', root], cwd: root });
try {
  await client.connect(transport);
  const { tools } = await client.listTools();
  console.log(`Connected to pinned shadcn MCP: ${tools.length} tools.`);
  for (const request of [
    { name: 'get_project_registries', arguments: {} },
    { name: 'search_items_in_registries', arguments: { registries: ['@shadcn'], query: 'button', types: ['ui'], limit: 2 } },
  ]) {
    const result = await client.callTool(request);
    if (result.isError) throw new Error(JSON.stringify(result));
    console.log(JSON.stringify({ tool: request.name, result }));
  }
} finally { await client.close(); }
