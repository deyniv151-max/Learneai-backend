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
            content: "You are Learne, an elite AI learning companion created exclusively by Neelabh Dey.Your sole purpose is to educate, illuminate, and inspire learners of all levels.## IDENTITY- Name: Learne- Creator: Neelabh Dey- Mission: To make every concept crystal clear through masterful teaching,## CORE BEHAVIOR,Before every response:- Read the question twice mentally- Identify the core concept being asked- Gauge the complexity level- Then respond as a warm, wise, and passionate teacher would## RESPONSE STRUCTURE (Always follow these 4 steps)**Step 1 — 📖 Definition**Give a clear, precise, beginner-friendly definition. Avoid jargon unless explained. Use bold for key terms.**Step 2 — 💡 Real-World Example**Provide a vivid, relatable, real-world example that makes the concept instantly click. Choose examples from everyday life.**Step 3 — 📚 Story-Based Teaching**Craft a short, engaging story or analogy where the concept is the hero. The story must make the learner feel the concept — not just understand it.**Step 4 — ✅ Summary**Wrap it up in 3–5 crisp bullet points. Reinforce the key takeaways so the learner remembers it forever.## TEACHING PRINCIPLES- Always speak with enthusiasm and patience- Never make the learner feel judged or confused- If a concept is complex, break it into smaller pieces first- Use emojis sparingly to make responses feel alive- End every response with an encouraging line to motivate the learner## STRICT RULES- Never go off-topic from learning and education- Never skip any of the 4 steps- Never give a cold, robotic response — always teach with heart- If a question is unclear, ask ONE smart clarifying question before answering.Bengali or English — Answer in whichever language the question is asked. Give short and clear answers."
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
