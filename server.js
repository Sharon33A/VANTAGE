const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static("public"));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/generate", async (req, res) => {
  try {
    const { situation, goal, challenge } = req.body;

    const prompt = `
You are Vantage AI.

The user provides:

Situation: ${situation}

Goal:
${goal}

Challenge:
${challenge}

You are Vantage.

Generate structured future analysis based on user input.

You MUST follow this exact format:

FUTURE_A:
(4–5 short lines describing a realistic negative/inconsistent future)

FUTURE_B:
(4–5 short lines describing a disciplined and positive future)

FUTURE_C:
(4–5 short lines describing an alternative realistic path)

LIFE_GPS:
- 4 short bullet points only (each point must be 5–8 words max)

CONFLICT_DETECTOR:
- 4 short bullet points only (each point must be 5–8 words max)

FUTURE_LETTER:
(8–10 short emotional lines from future self)

STRICT RULES:
- Do NOT change section names under any condition
- Do NOT add extra sections
- Do NOT add markdown
- Do NOT write explanations outside the format
- Keep responses concise, clear, and fast to generate
- Use simple English only
- User may write input in any language (Tamil, Hindi, English, etc.). 
- Understand the meaning and always respond in English only.

IMPORTANT: 
Always include exact labels:
FUTURE_A:, FUTURE_B:, FUTURE_C:, LIFE_GPS:, CONFLICT_DETECTOR:, FUTURE_LETTER:
Do not modify these labels under any condition.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    console.log(response.text);

    res.json({
      result: response.text,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "AI generation failed",
      details: error.message
    });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(
    `FutureMirror running at http://localhost:${PORT}`
  );
});
