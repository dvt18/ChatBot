import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
// Note: In a real app, you'd want to securely store this or proxy through a backend.
// Since this is a local/frontend-only setup, the user will need to provide their key.
let genAI = null;
let model = null;

export const initGemini = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is not defined in .env file");
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    return true;
  } catch (error) {
    console.error("Failed to initialize Gemini:", error);
    return false;
  }
};

export const generateResponse = async (history, newMessage) => {
  if (!model) {
    throw new Error("Gemini API not initialized. Please set your API key.");
  }

  try {
    // Format history for Gemini chat format
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Remove the most recent mock model response if it's there
    // Actually, we should just send the history up to the user's latest message,
    // plus the new user message.
    
    const chat = model.startChat({
      history: formattedHistory,
    }); // Wait, Gemini chat history requires alternating user/model. Let's just use generateContent for simplicity or use startChat properly.
    
    // Simpler approach: Just send all context as text
    const promptContext = history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
    const fullPrompt = `${promptContext}\nUser: ${newMessage}\nAssistant:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
