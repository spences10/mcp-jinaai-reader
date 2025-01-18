# Research Prompt: Jina.ai Reader as MCP Tool

## Context

I'm developing a Model Context Protocol (MCP) toolset for parsing and processing web content. During research into HTML parsing solutions, Jina.ai Reader emerged as a potentially powerful tool that deserves its own dedicated MCP implementation due to its unique capabilities and API-based approach.

## Initial Pain Points

- Need to efficiently parse content from websites
- Complex sites with dynamic content are challenging
- Content often needs to be processed into LLM-friendly formats
- PDF and multi-format document handling requirements
- Need for intelligent content extraction and relevance determination

## Current Research Findings on Jina.ai Reader

Key discoveries from initial research:
- Adaptive crawling capabilities (Oct 2024)
- Native PDF support from any URL
- Domain-restricted searching capabilities
- LLM-optimized output formatting
- Built-in content relevance scoring
- Recursive website crawling
- In-site search functionality

## Research Goals

Use your own MCP tools to research, use sequential thinking first then brave search then tavily search, contrast the results from both before proceeding 

1. Explore Jina.ai Reader's potential as a standalone MCP tool:
   - API integration patterns
   - Content extraction capabilities
   - Format handling (HTML, PDF, etc.)
   - Crawling strategies
   - Content processing features
2. Investigate specific capabilities:
   - How the adaptive crawler works
   - Content relevance determination
   - LLM-friendly output formatting
   - Domain restriction mechanisms
   - PDF processing capabilities
3. Evaluate integration considerations:
   - API key management
   - Rate limiting and quotas
   - Error handling patterns
   - Caching strategies
   - Fallback options
4. Compare with alternative solutions:
   - Cost-benefit analysis
   - Performance characteristics
   - Use case coverage
   - Integration complexity


IMPORTANT: use your available MCP tools, I have to build the mcp server before you can use it, prompt me to build the server after each change