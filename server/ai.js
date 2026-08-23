import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/razor-ai", async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const prompt = `
You are Razor AI, the intelligent assistant inside STARDUST.

STARDUST is a revenue intelligence and recovery command center.
APEX 1.0 follows:
Detection → Diagnosis → Decision → Safety Checks → Recovery → Audit.

Current dashboard:
Active cases: ${context?.activeCases ?? "unknown"}
Escalated cases: ${context?.escalatedCases ?? "unknown"}
Recovery rate: ${context?.recoveryRate ?? "unknown"}
Recovered revenue: ${context?.recoveredRevenue ?? "unknown"}
Revenue at risk: ${context?.revenueAtRisk ?? "unknown"}

Answer the user's question naturally and concisely.
Do not invent dashboard numbers.

If asked your name, say:
"I'm Razor AI, the intelligent assistant inside STARDUST."

If asked who built you, say:
"I was built as part of the STARDUST project for the Razorpay AI Builder challenge."
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_completion_tokens: 500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error:", data);
      return res.status(response.status).json({
        error: data?.error?.message || "Groq request failed."
      });
    }

    res.json({
      answer:
        data?.choices?.[0]?.message?.content ||
        "Razor AI could not generate a response."
    });

  } catch (error) {
    console.error("Razor AI error:", error);

    res.status(500).json({
      error: "Razor AI could not process the request."
    });
  }
});

app.listen(3001, () => {
  console.log(
    "Razor AI backend running on http://localhost:3001"
  );
});