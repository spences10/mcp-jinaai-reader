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

		this.server.onerror = (error) =>
			console.error('[MCP Error]', error);
	}

	private setup_handlers() {
		this.server.setRequestHandler(
			ListToolsRequestSchema,
			async () => ({
				tools: [
					{
						name: 'read_url',
						description:
							'Convert any URL to LLM-friendly text using Jina.ai Reader',
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
								timeout: {
									type: 'number',
									description:
										'Maximum time in seconds to wait for webpage load',
								},
								target_selector: {
									type: 'string',
									description:
										'CSS selector to focus on specific elements',
								},
								wait_for_selector: {
									type: 'string',
									description:
										'CSS selector to wait for specific elements',
								},
								remove_selector: {
									type: 'string',
									description:
										'CSS selector to exclude specific elements',
								},
								with_links_summary: {
									type: 'boolean',
									description:
										'Gather all links at the end of response',
								},
								with_images_summary: {
									type: 'boolean',
									description:
										'Gather all images at the end of response',
								},
								with_generated_alt: {
									type: 'boolean',
									description:
										'Add alt text to images lacking captions',
								},
								with_iframe: {
									type: 'boolean',
									description: 'Include iframe content in response',
								},
							},
							required: ['url'],
						},
					},
				],
			}),
		);

		this.server.setRequestHandler(
			CallToolRequestSchema,
			async (request) => {
				if (request.params.name !== 'read_url') {
					throw new McpError(
						ErrorCode.MethodNotFound,
						`Unknown tool: ${request.params.name}`,
					);
				}

				const args = request.params.arguments as Record<
					string,
					unknown
				>;

				if (
					!args ||
					typeof args.url !== 'string' ||
					!is_valid_url(args.url)
				) {
					throw new McpError(
						ErrorCode.InvalidParams,
						'Invalid or missing URL parameter',
					);
				}

				try {
					const headers: Record<string, string> = {
						Accept:
							typeof args.format === 'string' &&
							args.format === 'stream'
								? 'text/event-stream'
								: 'application/json',
						'Content-Type': 'application/json',
						Authorization: `Bearer ${JINAAI_API_KEY}`,
					};

					// Optional headers from documentation
					if (typeof args.no_cache === 'boolean' && args.no_cache) {
						headers['X-No-Cache'] = 'true';
					}
					if (typeof args.timeout === 'number') {
						headers['X-Timeout'] = args.timeout.toString();
					}
					if (typeof args.target_selector === 'string') {
						headers['X-Target-Selector'] = args.target_selector;
					}
					if (typeof args.wait_for_selector === 'string') {
						headers['X-Wait-For-Selector'] = args.wait_for_selector;
					}
					if (typeof args.remove_selector === 'string') {
						headers['X-Remove-Selector'] = args.remove_selector;
					}
					if (
						typeof args.with_links_summary === 'boolean' &&
						args.with_links_summary
					) {
						headers['X-With-Links-Summary'] = 'true';
					}
					if (
						typeof args.with_images_summary === 'boolean' &&
						args.with_images_summary
					) {
						headers['X-With-Images-Summary'] = 'true';
					}
					if (
						typeof args.with_generated_alt === 'boolean' &&
						args.with_generated_alt
					) {
						headers['X-With-Generated-Alt'] = 'true';
					}
					if (
						typeof args.with_iframe === 'boolean' &&
						args.with_iframe
					) {
						headers['X-With-Iframe'] = 'true';
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
					const message =
						error instanceof Error ? error.message : String(error);
					throw new McpError(
						ErrorCode.InternalError,
						`Failed to process URL: ${message}`,
					);
				}
			},
		);
	}

	async run() {
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
		console.error('Jina Reader MCP server running on stdio');
	}
}

const server = new JinaReaderServer();
server.run().catch(console.error);
