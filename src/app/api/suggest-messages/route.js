import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function GET() {
  try {
    // AI Prompt: Generate 3 engaging, friendly questions
    const prompt = `Generate three different, engaging, and unique open-ended questions for an anonymous social platform. 
    Each question should be separated by '||'. The questions must be diverse, fresh, and not repeated from past responses. 
    Use randomness to ensure variation in each request.`;

    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const generatedText = result.response.text();

    // Split the response by '||' to get separate questions
    const suggestions = generatedText.split("||").map(q => q.trim()).filter(q => q.length > 0);

    return Response.json({ 
      success: true, 
      suggestions: suggestions.length > 0 ? suggestions : [
        "What's something you've always wanted to try but haven't yet?",
        "If you could instantly master any skill, what would it be?",
        "What's a small thing that always makes your day better?"
      ]
    }, { 
      status: 200 
    });

  } catch (error) {
    console.error("Error generating questions:", error);
    // Fallback questions in case of API failure
    return Response.json({ 
      success: true,
      suggestions: [
        "What's the most interesting thing you learned recently?",
        "If you could have dinner with anyone (living or dead), who would it be?",
        "What's something you're looking forward to?"
      ]
    }, { 
      status: 200 
    });
  }
}