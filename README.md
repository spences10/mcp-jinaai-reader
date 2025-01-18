# mcp-jinaai-reader

A Model Context Protocol (MCP) server for integrating Jina.ai's Reader API with LLMs. This server provides efficient and comprehensive web content extraction capabilities, optimized for documentation and web content analysis.

## Features

- 📚 Advanced web content extraction through Jina.ai Reader API
- 🚀 Fast and efficient content retrieval
- 📄 Complete text extraction with preserved structure
- 🔄 Clean format optimized for LLMs
- 🌐 Support for various content types including documentation
- 🏗️ Built on the Model Context Protocol

## Configuration

This server requires configuration through your MCP client. Here are examples for different environments:

### Cline Configuration

Add this to your Cline MCP settings:

```json
{
  "mcpServers": {
    "jinaai-reader": {
      "command": "node",
      "args": ["/path/to/mcp-jinaai-reader/dist/index.js"],
      "env": {
        "JINAAI_API_KEY": "your-jinaai-api-key"
      }
    }
  }
}
```

### Claude Desktop with WSL Configuration

For WSL environments, add this to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "jinaai-reader": {
      "command": "wsl.exe",
      "args": [
        "bash",
        "-c",
        "JINAAI_API_KEY=your-jinaai-api-key node /path/to/mcp-jinaai-reader/dist/index.js"
      ]
    }
  }
}
```

### Environment Variables

The server requires the following environment variable:

- `JINAAI_API_KEY`: Your Jina.ai API key (required)

## API

The server implements a single MCP tool with configurable parameters:

### read_url

Convert any URL to LLM-friendly text using Jina.ai Reader.

Parameters:

- `url` (string, required): URL to process
- `no_cache` (boolean, optional): Bypass cache for fresh results. Defaults to false
- `format` (string, optional): Response format ("json" or "stream"). Defaults to "json"
- `timeout` (number, optional): Maximum time in seconds to wait for webpage load
- `target_selector` (string, optional): CSS selector to focus on specific elements
- `wait_for_selector` (string, optional): CSS selector to wait for specific elements
- `remove_selector` (string, optional): CSS selector to exclude specific elements
- `with_links_summary` (boolean, optional): Gather all links at the end of response
- `with_images_summary` (boolean, optional): Gather all images at the end of response
- `with_generated_alt` (boolean, optional): Add alt text to images lacking captions
- `with_iframe` (boolean, optional): Include iframe content in response

## Development

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Run in development mode:

```bash
npm run dev
```

### Publishing

1. Update version in package.json
2. Build the project:

```bash
npm run build
```

3. Publish to npm:

```bash
npm publish
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built on the [Model Context Protocol](https://github.com/modelcontextprotocol)
- Powered by [Jina.ai Reader API](https://jina.ai)
