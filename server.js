const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');

const app  = express();
const PORT = 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'llama-3.3-70b-versatile'; // fast & free
// ── Middleware ──
app.use(cors());
app.use(express.json());

// ════════════════════════════════════════════════════
//  ROUTE: POST /api/chat
//  Frontend এখানে message পাঠাবে
// ════════════════════════════════════════════════════
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array দরকার।' });
  }

  console.log(`📩 Request এলো। মোট message: ${messages.length}`);

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model:    MODEL,
        messages: [
          {
            role:    'system',
            content: 'তুমি একজন বুদ্ধিমান AI সহকারী।Your name is learne.You are created by Neelabh. বাংলা বা ইংরেজি — যেভাষায় প্রশ্ন সেভাষায় উত্তর দাও। সংক্ষিপ্ত ও স্পষ্ট উত্তর দাও।'
          },
          ...messages
        ],
        max_tokens:  1024,
        temperature: 0.7
      })
    });

    if (!groqRes.ok) {
      const err = await groqRes.json();
      throw new Error(err?.error?.message || `Groq API error: ${groqRes.status}`);
    }

    const data  = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) throw new Error('Groq থেকে কোনো উত্তর আসেনি।');

    console.log(`✅ উত্তর পাঠানো হলো (${reply.length} chars)`);
    res.json({ reply });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ════════════════════════════════════════════════════
//  ROUTE: GET /api/health
// ════════════════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({ status: 'running', time: new Date().toISOString() });
});

// ── Server চালু ──
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════╗
║  ✅ Backend চালু হয়েছে! (Groq Free)     ║
║  🌐 http://localhost:${PORT}               ║
║  📡 POST /api/chat  → AI chat           ║
║  💚 GET  /api/health → health check     ║
╚══════════════════════════════════════════╝
  `);
});
