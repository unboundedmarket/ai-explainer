const axios = require('axios');

function createPromptFromFiles(files) {
  const fileList = files
    .map(f => `- ${f.path}`)
    .join('\n');

  const contentHeader = files
    .map(f => `----- FILE: ${f.path} -----\n${f.content.trim()}`)
    .join('\n\n');

  return `
You are an expert on Cardano smart contracts written in Plutus, Aiken, or other Cardano smart contract languages.

Below is a folder containing Cardano smart contract code.

List of files:
${fileList}

Contents:
${contentHeader}

If the files above are Cardano smart contracts:
Please explain in detail what this Cardano smart contract does, including its purpose, major functions, validators, datums, redeemers, and access control (if any).
First provide a high-level summary with title, then provide a detailed explanation in Markdown format.
Quote code snippets if necessary. Pay special attention to Cardano-specific concepts like UTxO model, validators, minting policies, and on-chain/off-chain code patterns.

If the files above are NOT Cardano smart contracts:
Briefly explain why they are not Cardano smart contracts and keep the answer very short. Start with "Error:".
  `.trim();
}

async function callLLM(prompt, messages = null) {
  const apiUrl = process.env.OPENAI_API_URL;
  const apiKey = process.env.OPENAI_API_KEY;
  const modelId = process.env.MODEL_ID || 'gpt-4';
  const maxTokens = parseInt(process.env.MAX_TOKENS, 10) || 4000;

  if (!apiUrl || !apiKey) {
    throw new Error('Missing OPENAI_API_URL or OPENAI_API_KEY in environment variables');
  }

  const chatMessages = messages || [{ role: 'user', content: prompt }];

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: modelId,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: maxTokens
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 60000
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    }

    throw new Error('Invalid response format from LLM API');

  } catch (error) {
    if (error.response) {
      throw new Error(`LLM API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error('No response from LLM API - check your network connection and API URL');
    } else {
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
}

async function explainContract(files) {
  const prompt = createPromptFromFiles(files);
  const analysis = await callLLM(prompt);
  return analysis;
}

module.exports = explainContract;
module.exports.callLLM = callLLM;
