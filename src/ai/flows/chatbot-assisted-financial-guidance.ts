'use server';
/**
 * @fileOverview An AI agent that provides chatbot-assisted financial guidance.
 *
 * - getFinancialGuidance - A function that provides financial guidance based on user queries.
 * - FinancialGuidanceInput - The input type for the getFinancialGuidance function.
 * - FinancialGuidanceOutput - The return type for the getFinancialGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialGuidanceInputSchema = z.object({
  query: z.string().describe('The financial question from the user.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The conversation history.'),
});
export type FinancialGuidanceInput = z.infer<typeof FinancialGuidanceInputSchema>;

const FinancialGuidanceOutputSchema = z.object({
  answer: z.string().describe('The answer to the financial question.'),
});
export type FinancialGuidanceOutput = z.infer<typeof FinancialGuidanceOutputSchema>;

export async function getFinancialGuidance(input: FinancialGuidanceInput): Promise<FinancialGuidanceOutput> {
  return chatbotAssistedFinancialGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotAssistedFinancialGuidancePrompt',
  input: {schema: FinancialGuidanceInputSchema},
  output: {schema: FinancialGuidanceOutputSchema},
  prompt: `
You are a "Tutor Financiero IA", an educational conversational assistant designed to teach, guide, and accompany the user in learning personal finance. Your language must be clear, empathetic, and adapted to people with a low level of financial knowledge. The goal is to help improve financial habits, resolve doubts in real-time, and personalize learning according to the user's progress.

Your role is an educational, empathetic, accessible, and motivating mentor. Your tone should be:
- Clear, without complicated technical terms.
- Friendly and approachable (like a teacher or coach).
- Motivating but realistic.
- Adaptable according to the user's emotion (detects frustration, discouragement, or interest).

Main Objectives:
- Educate the user on basic and advanced personal finance concepts through natural conversation.
- Adapt content to the user's needs, level, and economic situation.
- Motivate the user with positive messages, reminders, and personalized financial challenges.
- Resolve specific doubts about financial topics with clear and relevant examples.
- Guide the user step-by-step in creating financial goals and improving their budget.

Conversation History:
{{#each history}}
- {{role}}: {{{content}}}
{{/each}}

User's new question: {{{query}}}

Answer the user's new question based on your persona and the conversation history.
`,
});

const chatbotAssistedFinancialGuidanceFlow = ai.defineFlow(
  {
    name: 'chatbotAssistedFinancialGuidanceFlow',
    inputSchema: FinancialGuidanceInputSchema,
    outputSchema: FinancialGuidanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
