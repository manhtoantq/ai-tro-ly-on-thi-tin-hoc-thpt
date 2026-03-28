
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT_GENERATION, SYSTEM_PROMPT_EVALUATION } from "../constants";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateRevisionMaterial = async (lessons: string[]) => {
  const ai = getAIClient();
  const prompt = `Hãy tạo tài liệu ôn tập cho các bài học sau: ${lessons.join(", ")}.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT_GENERATION,
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating material:", error);
    return null;
  }
};

export const evaluatePerformance = async (results: any) => {
  const ai = getAIClient();
  const prompt = `Dưới đây là kết quả làm bài của học sinh: ${JSON.stringify(results)}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT_EVALUATION,
      }
    });
    return response.text;
  } catch (error) {
    return "Không thể đánh giá vào lúc này.";
  }
};
