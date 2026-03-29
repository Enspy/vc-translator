const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { MASTER_SYSTEM_PROMPT, DIALECT_PROMPTS } = require('./prompts');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Override any platform-injected CSP headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; font-src 'self';"
  );
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "You're thinking too fast. Even Naval takes breaks.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).send("You're thinking too fast. Even Naval takes breaks.");
  },
});

const injectionPatterns = [
  /ignore (all |previous |above )?instructions/i,
  /you are now/i,
  /new persona/i,
  /act as/i,
  /forget (everything|all|your)/i,
  /system prompt/i,
  /disregard/i,
  /jailbreak/i,
  /\[INST\]/i,
  /<\|system\|>/i,
  /do anything now/i,
  /DAN/,
];

const VALID_DIALECTS = ['andreessen', 'tanglish', 'navali', 'chamath', 'pg', 'illscience'];

app.post('/api/translate', limiter, async (req, res) => {
  const { input, dialect } = req.body;

  // Input length cap
  if (!input || typeof input !== 'string' || input.length > 500) {
    return res.status(400).send('Even VCs know when to stop talking. Keep it under 500 characters.');
  }

  // Dialect validation
  if (!dialect || !VALID_DIALECTS.includes(dialect)) {
    return res.status(400).send('Unknown dialect.');
  }

  // Prompt injection detection
  for (const pattern of injectionPatterns) {
    if (pattern.test(input)) {
      return res.status(400).send("Nice try. Even Andreessen couldn't prompt inject his way out of this one.");
    }
  }

  const systemPrompt = MASTER_SYSTEM_PROMPT + '\n\n' + DIALECT_PROMPTS[dialect];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Translate this plain English into the specified VC dialect:\n\n${input}`,
        },
      ],
    });

    for await (const text of stream.textStream) {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Anthropic API error:', err.message);
    res.write(
      `data: ${JSON.stringify({ error: 'The algorithm failed. A sign, perhaps, that we are too early.' })}\n\n`
    );
    res.end();
  }
});

// Serve static build in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`VCTranslate server running on port ${PORT}`);
});
