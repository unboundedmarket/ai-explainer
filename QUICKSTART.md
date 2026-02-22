# Cardano Smart Contract Explainer

## Quick Start Guide

### 1. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 2. Configure API

Create `backend/.env` file:
```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your API key:
```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Start Services

#### Terminal 1 - Backend
```bash
cd backend
npm start
```

You should see:
```
Cardano Contract Explainer API running on http://localhost:3001
```

#### Terminal 2 - Frontend  
```bash
cd frontend
npm start
```

Browser will auto-open to `http://localhost:3000`

### 4. Usage

1. Upload a Cardano smart contract file (`.hs`, `.plutus`, `.ak`, etc.)
2. Click "Explain the Smart Contract"
3. View the explanation
4. Use the chat for follow-up questions

## Architecture

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Browser   │────────▶│   Express   │────────▶│   OpenAI     │
│   (React)   │◀────────│   Backend   │◀────────│   API        │
└─────────────┘         └─────────────┘         └──────────────┘
    Port 3000              Port 3001            External API
```

## Features

- File upload (drag & drop or click)
- Multiple file support (up to 100 files, 100KB total)
- AI-powered contract explanation
- Markdown rendering
- Download results
- Responsive design

## API Providers

Works with any OpenAI-compatible API:

- **OpenAI** (gpt-4, gpt-3.5-turbo)
- **Azure OpenAI**
- **Local LLMs** (Ollama, LM Studio)
- **Other** (Anthropic, Groq, Together AI)

## Troubleshooting

**Backend won't start:**
- Check `.env` file exists with valid API key
- Ensure port 3001 is not in use

**Frontend can't connect:**
- Verify backend is running on port 3001
- Check browser console for CORS errors

**API errors:**
- Verify API key is correct
- Check API endpoint URL in `.env`
- Ensure you have API credits/quota

## Development

**Backend hot reload:**
```bash
cd backend
npm install -g nodemon
npm run dev
```

**Build frontend for production:**
```bash
cd frontend
npm run build
```

## Next Steps

- Deploy to a hosting service
- Add more AI models
- Implement caching
- Add user authentication
- Store analysis history
