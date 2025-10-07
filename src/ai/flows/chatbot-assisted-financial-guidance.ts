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
  prompt: `You are a helpful financial tutor chatbot. Answer the following question clearly and concisely.\n\nQuestion: {{{query}}}`,
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
