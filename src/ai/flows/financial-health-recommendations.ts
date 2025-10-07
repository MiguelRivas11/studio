'use server';

/**
 * @fileOverview Generates tailored financial recommendations based on user-provided financial information.
 *
 * - financialHealthRecommendations - A function that processes user financial data and returns personalized recommendations.
 * - FinancialHealthRecommendationsInput - The input type for the financialHealthRecommendations function.
 * - FinancialHealthRecommendationsOutput - The return type for the financialHealthRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialHealthRecommendationsInputSchema = z.object({
  income: z.number().describe('Monthly income in USD.'),
  expenses: z.number().describe('Monthly expenses in USD.'),
  debt: z.number().describe('Total debt amount in USD.'),
  savings: z.number().describe('Total savings amount in USD.'),
  goals: z.string().describe('User financial goals.'),
});
export type FinancialHealthRecommendationsInput = z.infer<typeof FinancialHealthRecommendationsInputSchema>;

const FinancialHealthRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('Personalized financial recommendations.'),
});
export type FinancialHealthRecommendationsOutput = z.infer<typeof FinancialHealthRecommendationsOutputSchema>;

export async function financialHealthRecommendations(input: FinancialHealthRecommendationsInput): Promise<FinancialHealthRecommendationsOutput> {
  return financialHealthRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialHealthRecommendationsPrompt',
  input: {schema: FinancialHealthRecommendationsInputSchema},
  output: {schema: FinancialHealthRecommendationsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's financial situation and provide personalized recommendations based on their income, expenses, debt, savings, and goals.

Income: {{income}}
Expenses: {{expenses}}
Debt: {{debt}}
Savings: {{savings}}
Goals: {{goals}}

Provide specific and actionable recommendations to improve their financial health.`,
});

const financialHealthRecommendationsFlow = ai.defineFlow(
  {
    name: 'financialHealthRecommendationsFlow',
    inputSchema: FinancialHealthRecommendationsInputSchema,
    outputSchema: FinancialHealthRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
