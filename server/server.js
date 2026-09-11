import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ path: "./server/.env" });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.json({
    message: "CivicPulse AI server is running",
  });
});

app.post("/api/analyze-report", async (req, res) => {
  try {
    const { description, category } = req.body;

    if (!description) {
      return res.status(400).json({
        error: "Issue description is required.",
      });
    }

    const prompt = `
You are the AI analysis engine for CivicPulse, an intelligent civic and
environmental issue prioritization platform.

Analyze the following citizen report.

Citizen-selected category:
${category || "Unknown"}

Issue description:
${description}

Return a concise analysis containing:
1. detectedIssue
2. category
3. severity from 1 to 10
4. environmentalRisk from 1 to 10
5. healthRisk from 1 to 10
6. communityImpact from 1 to 10
7. recommendation

Be realistic and conservative. Do not invent facts that are not supported
by the report.
`;

const models = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
];

let response;
let lastError;

for (const model of models) {
  try {
    console.log(`Trying Gemini model: ${model}`);

    response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            detectedIssue: { type: "string" },
            category: { type: "string" },
            severity: { type: "integer" },
            environmentalRisk: { type: "integer" },
            healthRisk: { type: "integer" },
            communityImpact: { type: "integer" },
            recommendation: { type: "string" },
          },
          required: [
            "detectedIssue",
            "category",
            "severity",
            "environmentalRisk",
            "healthRisk",
            "communityImpact",
            "recommendation",
          ],
        },
      },
    });

    console.log(`Gemini model succeeded: ${model}`);
    break;
  } catch (error) {
    lastError = error;
    console.error(`Gemini model failed: ${model}`, error);

    if (error?.status !== 503) {
      throw error;
    }
  }
}

if (!response) {
  throw lastError || new Error("All Gemini models failed.");
}

 const analysis = JSON.parse(response.text);

 res.json({
  success: true,
  analysis,
  });
  } catch (error) {
    console.error("Gemini error:", error);

    res.status(500).json({
      success: false,
      error: "AI analysis failed.",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CivicPulse AI server running on port ${PORT}`);
});