# Cardano Smart Contract Explainer

An open-source tool for AI-powered analysis and explanation of Cardano smart contracts. Features include syntax-highlighted code viewing, Tree-Sitter analysis, execution flow visualization, interactive chat, and Cardano wallet integration.

## Features

- **Split-View Interface** -- Side-by-side code viewer and AI explanation
- **Tree-Sitter Analysis** -- Syntax tree visualization, dependency extraction, and condition detection for Python, Haskell, and Aiken contracts
- **Execution Flow** -- AI-generated DAG visualization of contract execution paths using ReactFlow
- **Interactive Chat** -- Follow-up questions about analyzed contracts
- **Contract Browser** -- Sidebar with search, pre-loaded example contracts, and file upload
- **Cardano Wallet** -- CIP-30 wallet connection (Nami, Eternl, Flint, etc.)
- **Dark Mode** -- Full dark/light theme support
- **Code Selection** -- Select code snippets to ask contextual questions

## Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key (or compatible LLM API)

### Installation

```bash
git clone <your-repo-url>
cd cardano-contract-explainer-standalone

cd backend
npm install
cp .env.example .env

cd ../frontend
npm install
```

### Configuration

Edit `backend/.env`:

```bash
PORT=3001
OPENAI_API_KEY=your_api_key_here
OPENAI_API_URL=https://api.openai.com/v1/chat/completions
MODEL_ID=gpt-4
```

### Running

```bash
cd backend
npm start

cd frontend
npm start
```

Visit: http://localhost:3000

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/explain` | POST | Explain uploaded contract files |
| `/api/chat` | POST | Follow-up chat about a contract |
| `/api/upload` | POST | Upload and explain a single file |
| `/api/openai` | POST | Generate execution flow DAG |
| `/health` | GET | Health check |

## API Configuration

The tool supports any OpenAI-compatible API:

- **OpenAI**: Use `https://api.openai.com/v1/chat/completions`
- **Azure OpenAI**: Use your Azure endpoint
- **Local LLM**: Use Ollama, LM Studio, or similar
- **Other providers**: Anthropic, Groq, Together AI, etc.

## Architecture

- **Frontend**: React + TypeScript with CRACO, Tailwind CSS
- **Backend**: Express.js with OpenAI integration
- **Code Analysis**: Tree-Sitter (WASM) for Python, Haskell, Aiken
- **Flow Visualization**: ReactFlow + dagre for DAG layout
- **Syntax Highlighting**: react-syntax-highlighter with Prism
- **Tree Visualization**: react-d3-tree for syntax tree rendering
- **Wallet**: @cardano-foundation/cardano-connect-with-wallet (CIP-30)

## License

MIT License - See LICENSE file

## Contributing

Contributions welcome! Please open an issue or PR.

## Links

- [UnboundedMarket](https://unboundedmarket.ai)
