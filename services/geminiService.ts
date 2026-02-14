
import { GoogleGenAI, Type } from "@google/genai";
import { AttendanceRecord, AIInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getWorkInsights = async (records: AttendanceRecord[]): Promise<AIInsight> => {
  const summaryData = records.map(r => ({
    empId: r.employeeId,
    date: r.date,
    duration: r.duration
  })).slice(-50); // Send last 50 records for context

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this employee work data and provide management insights for the CEO. 
    Focus on team productivity, potential burnout, and work-life balance.
    Data: ${JSON.stringify(summaryData)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: 'Overall analysis of team health and productivity.' },
          efficiencyScore: { type: Type.NUMBER, description: 'A score from 0-100 representing team efficiency.' },
          recommendations: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'List of actionable management recommendations.'
          },
        },
        required: ["summary", "efficiencyScore", "recommendations"],
      },
    },
  });

  return JSON.parse(response.text || '{}') as AIInsight;
};
