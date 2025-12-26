# Notion MCP Server

> [!NOTE] 
> 
> We’ve introduced **Notion MCP**, a remote MCP server with the following improvements:
> - Easy installation via standard OAuth. No need to fiddle with JSON or API token anymore.
> - Powerful tools tailored to AI agents. These tools are designed with optimized token consumption in mind.
> 
> Learn more and try it out [here](https://developers.notion.com/docs/mcp)


## 🧭 MAOS v1 Governance (Activ8-AI Fork)

This fork operates under MAOS v1 (Modular Automation Operating System) governance framework, which establishes:

- **Tier 3 Repository Classification**: Full governance controls with automated agent workflows
- **Charter Compliance**: All changes must align with Charter Standards for security, modularity, and provider-agnostic design
- **Fail-Closed Enforcement**: Required governance checks must pass before merge
- **Human Authority**: All merges require explicit human approval
- **Audit Trail**: Comprehensive logging and compliance tracking

### Fork-Specific Governance

This is an Activ8-AI maintained fork of [Notion MCP Server](https://github.com/makenotion/notion-mcp-server).

**Upstream Synchronization**:
- Regular syncs with upstream Notion MCP Server repository
- Activ8-AI specific modifications tracked separately
- Governance requirements apply to Activ8-AI changes only

**Contribution Guidelines**:
- Upstream contributions should be made to the original Notion repository
- Activ8-AI specific features require governance approval
- See main repository [Activ8-AI/mcp](https://github.com/Activ8-AI/mcp) for governance details

For complete governance documentation, see:
- **Main Repository**: [Activ8-AI/mcp](https://github.com/Activ8-AI/mcp) - Primary governance standards
- **Upstream**: [makenotion/notion-mcp-server](https://github.com/makenotion/notion-mcp-server) - Original project
- **Notion MCP Docs**: [developers.notion.com/docs/mcp](https://developers.notion.com/docs/mcp) - Official MCP integration
- **MCP Protocol**: [spec.modelcontextprotocol.io](https://spec.modelcontextprotocol.io/) - Protocol specification
- **Notion API**: [developers.notion.com/reference/intro](https://developers.notion.com/reference/intro) - API reference

### High-Risk Powers

This Notion MCP server has specific governance requirements:

- **Notion Integration**: Full access to Notion workspace pages and databases
- **MCP Protocol**: Model Context Protocol server implementation
- **API Operations**: Comprehensive Notion API operations (search, create, update, comment)
- **Integration Tokens**: Notion internal integration authentication
- **OAuth Support**: Standard OAuth for easy installation
- **Page Access**: Read/write access to connected Notion pages
- **Database Operations**: Query and modify Notion databases
- **Comment Creation**: Add comments to pages and databases
- **STDIO Transport**: Standard input/output MCP communication
- **HTTP Transport**: Streamable HTTP MCP endpoints with authentication
- **Docker Deployment**: Containerized server deployment
- **OpenAPI MCP**: OpenAPI specification for MCP operations

All high-risk operations are:
- Gated behind required human approval
- Logged for audit compliance
- Subject to automated security scanning
- Governed by principle of least privilege
- Require secure credential management

### Security Notes

- **Integration Tokens**: Never commit Notion integration tokens (`ntn_****`) to version control
- **OAuth Credentials**: Secure OAuth client secrets and tokens
- **Page Permissions**: Grant integration access only to required pages
- **Read-Only Option**: Use read-only integration capabilities when write access isn't needed
- **Bearer Tokens**: Protect HTTP transport bearer authentication tokens
- **Environment Variables**: Use `.env` files for all credentials (exclude from git)
- **Token Rotation**: Regularly rotate Notion integration tokens
- **Access Auditing**: Review Notion integration access regularly
- **MCP Security**: Secure MCP server endpoints and authentication
- **Docker Security**: Keep Docker images updated and scan for vulnerabilities
- **PII Protection**: Be cautious with personal data in Notion pages exposed to LLMs
- **Database Scope**: Limit database exposure to minimize data access risk
- **HTTP Authentication**: Use strong bearer tokens for HTTP transport
- **Session Management**: Implement proper MCP session handling

![notion-mcp-sm](https://github.com/user-attachments/assets/6c07003c-8455-4636-b298-d60ffdf46cd8)

This project implements an [MCP server](https://spec.modelcontextprotocol.io/) for the [Notion API](https://developers.notion.com/reference/intro). 

![mcp-demo](https://github.com/user-attachments/assets/e3ff90a7-7801-48a9-b807-f7dd47f0d3d6)

### Installation

#### 1. Setting up Integration in Notion:
Go to [https://www.notion.so/profile/integrations](https://www.notion.so/profile/integrations) and create a new **internal** integration or select an existing one.

![Creating a Notion Integration token](docs/images/integrations-creation.png)

While we limit the scope of Notion API's exposed (for example, you will not be able to delete databases via MCP), there is a non-zero risk to workspace data by exposing it to LLMs. Security-conscious users may want to further configure the Integration's _Capabilities_. 

For example, you can create a read-only integration token by giving only "Read content" access from the "Configuration" tab:

![Notion Integration Token Capabilities showing Read content checked](docs/images/integrations-capabilities.png)

#### 2. Connecting content to integration:
Ensure relevant pages and databases are connected to your integration.

To do this, visit the **Access** tab in your internal integration settings. Edit access and select the pages you'd like to use.
![Integration Access tab](docs/images/integration-access.png)

![Edit integration access](docs/images/page-access-edit.png)

Alternatively, you can grant page access individually. You'll need to visit the target page, and click on the 3 dots, and select "Connect to integration". 

![Adding Integration Token to Notion Connections](docs/images/connections.png)

#### 3. Adding MCP config to your client:

##### Using npm:

**Cursor & Claude:**

Add the following to your `.cursor/mcp.json` or `claude_desktop_config.json` (MacOS: `~/Library/Application\ Support/Claude/claude_desktop_config.json`)

**Option 1: Using NOTION_TOKEN (recommended)**
```javascript
{
  "mcpServers": {
    "notionApi": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "ntn_****"
      }
    }
  }
}
```

**Option 2: Using OPENAPI_MCP_HEADERS (for advanced use cases)**
```javascript
{
  "mcpServers": {
    "notionApi": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer ntn_****\", \"Notion-Version\": \"2022-06-28\" }"
      }
    }
  }
}
```

**Zed**

Add the following to your `settings.json`

```json
{
  "context_servers": {
    "some-context-server": {
      "command": {
        "path": "npx",
        "args": ["-y", "@notionhq/notion-mcp-server"],
        "env": {
          "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer ntn_****\", \"Notion-Version\": \"2022-06-28\" }"
        }
      },
      "settings": {}
    }
  }
}
```

##### Using Docker:

There are two options for running the MCP server with Docker:

###### Option 1: Using the official Docker Hub image:

Add the following to your `.cursor/mcp.json` or `claude_desktop_config.json`:

**Using NOTION_TOKEN (recommended):**
```javascript
{
  "mcpServers": {
    "notionApi": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e", "NOTION_TOKEN",
        "mcp/notion"
      ],
      "env": {
        "NOTION_TOKEN": "ntn_****"
      }
    }
  }
}
```

**Using OPENAPI_MCP_HEADERS (for advanced use cases):**
```javascript
{
  "mcpServers": {
    "notionApi": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e", "OPENAPI_MCP_HEADERS",
        "mcp/notion"
      ],
      "env": {
        "OPENAPI_MCP_HEADERS": "{\"Authorization\":\"Bearer ntn_****\",\"Notion-Version\":\"2022-06-28\"}"
      }
    }
  }
}
```

This approach:
- Uses the official Docker Hub image
- Properly handles JSON escaping via environment variables
- Provides a more reliable configuration method

###### Option 2: Building the Docker image locally:

You can also build and run the Docker image locally. First, build the Docker image:

```bash
docker compose build
```

Then, add the following to your `.cursor/mcp.json` or `claude_desktop_config.json`:

**Using NOTION_TOKEN (recommended):**
```javascript
{
  "mcpServers": {
    "notionApi": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "NOTION_TOKEN=ntn_****",
        "notion-mcp-server"
      ]
    }
  }
}
```

**Using OPENAPI_MCP_HEADERS (for advanced use cases):**
```javascript
{
  "mcpServers": {
    "notionApi": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "OPENAPI_MCP_HEADERS={\"Authorization\": \"Bearer ntn_****\", \"Notion-Version\": \"2022-06-28\"}",
        "notion-mcp-server"
      ]
    }
  }
}
```

Don't forget to replace `ntn_****` with your integration secret. Find it from your integration configuration tab:

![Copying your Integration token from the Configuration tab in the developer portal](https://github.com/user-attachments/assets/67b44536-5333-49fa-809c-59581bf5370a)


#### Installing via Smithery

[![smithery badge](https://smithery.ai/badge/@makenotion/notion-mcp-server)](https://smithery.ai/server/@makenotion/notion-mcp-server)

To install Notion API Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@makenotion/notion-mcp-server):

```bash
npx -y @smithery/cli install @makenotion/notion-mcp-server --client claude
```

### Transport Options

The Notion MCP Server supports two transport modes:

#### STDIO Transport (Default)
The default transport mode uses standard input/output for communication. This is the standard MCP transport used by most clients like Claude Desktop.

```bash
# Run with default stdio transport
npx @notionhq/notion-mcp-server

# Or explicitly specify stdio
npx @notionhq/notion-mcp-server --transport stdio
```

#### Streamable HTTP Transport
For web-based applications or clients that prefer HTTP communication, you can use the Streamable HTTP transport:

```bash
# Run with Streamable HTTP transport on port 3000 (default)
npx @notionhq/notion-mcp-server --transport http

# Run on a custom port
npx @notionhq/notion-mcp-server --transport http --port 8080

# Run with a custom authentication token
npx @notionhq/notion-mcp-server --transport http --auth-token "your-secret-token"
```

When using Streamable HTTP transport, the server will be available at `http://0.0.0.0:<port>/mcp`.

##### Authentication
The Streamable HTTP transport requires bearer token authentication for security. You have three options:

**Option 1: Auto-generated token (recommended for development)**
```bash
npx @notionhq/notion-mcp-server --transport http
```
The server will generate a secure random token and display it in the console:
```
Generated auth token: a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789ab
Use this token in the Authorization header: Bearer a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789ab
```

**Option 2: Custom token via command line (recommended for production)**
```bash
npx @notionhq/notion-mcp-server --transport http --auth-token "your-secret-token"
```

**Option 3: Custom token via environment variable (recommended for production)**
```bash
AUTH_TOKEN="your-secret-token" npx @notionhq/notion-mcp-server --transport http
```

The command line argument `--auth-token` takes precedence over the `AUTH_TOKEN` environment variable if both are provided.

##### Making HTTP Requests
All requests to the Streamable HTTP transport must include the bearer token in the Authorization header:

```bash
# Example request
curl -H "Authorization: Bearer your-token-here" \
     -H "Content-Type: application/json" \
     -H "mcp-session-id: your-session-id" \
     -d '{"jsonrpc": "2.0", "method": "initialize", "params": {}, "id": 1}' \
     http://localhost:3000/mcp
```

**Note:** Make sure to set either the `NOTION_TOKEN` environment variable (recommended) or the `OPENAPI_MCP_HEADERS` environment variable with your Notion integration token when using either transport mode.

### Examples

1. Using the following instruction
```
Comment "Hello MCP" on page "Getting started"
```

AI will correctly plan two API calls, `v1/search` and `v1/comments`, to achieve the task

2. Similarly, the following instruction will result in a new page named "Notion MCP" added to parent page "Development"
```
Add a page titled "Notion MCP" to page "Development"
```

3. You may also reference content ID directly
```
Get the content of page 1a6b35e6e67f802fa7e1d27686f017f2
```

### Development

Build

```
npm run build
```

Execute

```
npx -y --prefix /path/to/local/notion-mcp-server @notionhq/notion-mcp-server
```

Publish

```
npm publish --access public
```
