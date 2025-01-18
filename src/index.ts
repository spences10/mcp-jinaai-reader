#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ErrorCode,
	ListToolsRequestSchema,
	McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(
	readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
);
const { name, version } = pkg;

const JINAAI_API_KEY = process.env.JINAAI_API_KEY;
if (!JINAAI_API_KEY) {
	throw new Error('JINAAI_API_KEY environment variable is required');
}

interface JinaReaderResponse {
	text: string;
	error?: string;
}

const is_valid_url = (url: string): boolean => {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
};

class JinaReaderServer {
	private server: Server;
	private base_url = 'https://r.jina.ai/';

	constructor() {
		this.server = new Server(
			{
				name,
				version,
			},
			{
				capabilities: {
					tools: {},
				},
			},
		);

		this.setup_handlers();
		
		this.server.onerror = (error) => console.error('[MCP Error]', error);
	}

	private setup_handlers() {
		this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
			tools: [
				{
					name: 'read_url',
					description: 'Convert any URL to LLM-friendly text using Jina.ai Reader',
					inputSchema: {
						type: 'object',
						properties: {
							url: {
								type: 'string',
								description: 'URL to process',
							},
							no_cache: {
								type: 'boolean',
								description: 'Bypass cache for fresh results',
								default: false,
							},
							format: {
								type: 'string',
								description: 'Response format (json or stream)',
								enum: ['json', 'stream'],
								default: 'json',
							},
						},
						required: ['url'],
					},
				},
			],
		}));

		this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
			if (request.params.name !== 'read_url') {
				throw new McpError(
					ErrorCode.MethodNotFound,
					`Unknown tool: ${request.params.name}`,
				);
			}

			const args = request.params.arguments as {
				url: string;
				no_cache?: boolean;
				format?: 'json' | 'stream';
			};

			if (!args.url || !is_valid_url(args.url)) {
				throw new McpError(
					ErrorCode.InvalidParams,
					'Invalid or missing URL parameter',
				);
			}

			try {
				const headers: Record<string, string> = {
					Accept: args.format === 'stream' ? 'text/event-stream' : 'application/json',
					Authorization: `Bearer ${JINAAI_API_KEY}`,
				};

				if (args.no_cache) {
					headers['x-no-cache'] = 'true';
				}

				const response = await fetch(this.base_url + args.url, {
					headers,
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const result = await response.text();

				return {
					content: [
						{
							type: 'text',
							text: result,
						},
					],
				};
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				throw new McpError(ErrorCode.InternalError, `Failed to process URL: ${message}`);
			}
		});
	}

	async run() {
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
		console.error('Jina Reader MCP server running on stdio');
	}
}

const server = new JinaReaderServer();
server.run().catch(console.error);
