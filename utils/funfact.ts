import { googleAI } from '@genkit-ai/google-genai';
import { genkit } from 'genkit';

// Initialize Genkit with the Google AI plugin
const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-2.5-flash', {
    temperature: 0.8,
  }),
});

export async function getFunFact() {
  const response = await ai.generate({
    prompt: 'tell me a inspiring quote. response and author only',
  });

  return response.text;
}
