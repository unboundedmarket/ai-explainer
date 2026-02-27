require('dotenv').config();
const express = require('express');
const cors = require('cors');
const explainContract = require('./services/explainContract');
const { callLLM } = require('./services/explainContract');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin "${origin}" not allowed`));
      }
    },
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Cardano Contract Explainer' });
});

app.post('/api/explain', async (req, res) => {
  try {
    const { files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        error: 'Invalid input: expected non-empty "files" array.',
      });
    }

    const MAX_FILES = parseInt(process.env.MAX_FILES) || 100;
    const MAX_TOTAL_SIZE = (parseInt(process.env.MAX_TOTAL_SIZE_KB) || 100) * 1024;

    if (files.length > MAX_FILES) {
      return res.status(400).json({
        error: `Too many files: ${files.length} provided (max is ${MAX_FILES}).`,
      });
    }

    const isValid = files.every(
      (file) => typeof file.path === 'string' && typeof file.content === 'string'
    );
    if (!isValid) {
      return res.status(400).json({
        error: 'Each file must have "path" and "content" as strings.',
      });
    }

    const totalSize = files.reduce(
      (sum, file) => sum + Buffer.byteLength(file.content, 'utf8'),
      0
    );
    if (totalSize > MAX_TOTAL_SIZE) {
      return res.status(400).json({
        error: `Total size too large: ${(totalSize / 1024).toFixed(2)}KB (max is ${MAX_TOTAL_SIZE / 1024}KB).`,
      });
    }

    const analysis = await explainContract(files);
    return res.status(200).json({ analysis });
  } catch (err) {
    console.error('Error analyzing smart contract:', err.message);
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, contractCode } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Missing "message" field.' });
    }

    const systemPrompt = contractCode
      ? `You are a helpful Cardano smart contract expert. The user is asking about the following contract code:\n\n${contractCode}\n\nAnswer their questions about the code clearly and concisely.`
      : 'You are a helpful Cardano smart contract expert. Answer questions clearly and concisely.';

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((m) => ({ role: m.role, content: m.content })),
    ];

    if (
      messages.length === 1 ||
      messages[messages.length - 1].content !== message
    ) {
      messages.push({ role: 'user', content: message });
    }

    const answer = await callLLM(null, messages);
    return res.status(200).json({ answer });
  } catch (err) {
    console.error('Chat error:', err.message);
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

app.post('/api/upload', async (req, res) => {
  try {
    const { fileName, fileContent } = req.body;

    if (!fileName || !fileContent) {
      return res.status(400).json({ error: 'Missing "fileName" or "fileContent".' });
    }

    const files = [{ path: fileName, content: fileContent }];
    const explanation = await explainContract(files);

    return res.status(200).json({
      name: fileName.replace(/\.[^/.]+$/, ''),
      code: fileContent,
      explanation,
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

app.post('/api/openai', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Missing "code" field.' });
    }

    const prompt = `Analyze this smart contract code and generate a JSON execution flow DAG (Directed Acyclic Graph).
Return ONLY valid JSON with this format: { "nodes": [{ "id": "1", "label": "Step description" }], "links": [{ "source": "1", "target": "2" }] }

Code:
${code}`;

    const result = await callLLM(prompt);
    let flow;
    try {
      const cleaned = result.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      flow = JSON.parse(cleaned);
    } catch {
      flow = result;
    }

    return res.status(200).json({ flow });
  } catch (err) {
    console.error('OpenAI flow error:', err.message);
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Cardano Contract Explainer API running on http://localhost:${PORT}`);
  console.log(`Endpoints:`);
  console.log(`  POST /api/explain  - Explain contract files`);
  console.log(`  POST /api/chat     - Chat about contracts`);
  console.log(`  POST /api/upload   - Upload and explain a single file`);
  console.log(`  POST /api/openai   - Generate execution flow DAG`);

  if (!process.env.OPENAI_API_KEY) {
    console.warn('WARNING: OPENAI_API_KEY not set in .env file');
  }
});
