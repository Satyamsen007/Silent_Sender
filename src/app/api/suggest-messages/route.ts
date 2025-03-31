import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(`${process.env.GEMINI_API_KEY}`);

export async function GET() {
  try {
    // AI Prompt: Generate 3 engaging, friendly questions
    const prompt = `Generate three different, engaging, and unique open-ended questions for an anonymous social platform. 
    Each question should be separated by '||'. The questions must be diverse, fresh, and not repeated from past responses. 
    Use randomness to ensure variation in each request.`;
    ;

    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const generatedText = result.response.text();

    // Split the response by '||' to get separate questions
    const suggestions = generatedText.split("||").map((q) => q.trim());

    return Response.json({ success: true, suggestions }, { status: 200 });
  } catch (error) {
    console.error("Error generating questions:", error);
    return Response.json({ success: false, message: "AI error" }, { status: 500 });
  }
}
