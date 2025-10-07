'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized financial literacy learning paths.
 *
 * The flow takes user's financial background, goals, and current knowledge level as input
 * and returns a customized learning path with relevant educational resources.
 *
 * @interface PersonalizedLearningPathInput - Input schema for the personalized learning path flow.
 * @interface PersonalizedLearningPathOutput - Output schema for the personalized learning path flow.
 * @function generatePersonalizedLearningPath - The main function to generate a personalized learning path.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedLearningPathInputSchema = z.object({
  financialBackground: z
    .string()
    .describe('User\u2019s financial background and experience.'),
  financialGoals: z.string().describe('User\u2019s financial goals and aspirations.'),
  currentKnowledgeLevel: z
    .string()
    .describe('User\u2019s current understanding of financial concepts.'),
});

export type PersonalizedLearningPathInput = z.infer<
  typeof PersonalizedLearningPathInputSchema
>;

const PersonalizedLearningPathOutputSchema = z.object({
  learningPath: z
    .string()
    .describe('A personalized learning path tailored to the user\u2019s needs.'),
});

export type PersonalizedLearningPathOutput = z.infer<
  typeof PersonalizedLearningPathOutputSchema
>;

export async function generatePersonalizedLearningPath(
  input: PersonalizedLearningPathInput
): Promise<PersonalizedLearningPathOutput> {
  return personalizedLearningPathFlow(input);
}

const personalizedLearningPathPrompt = ai.definePrompt({
  name: 'personalizedLearningPathPrompt',
  input: {schema: PersonalizedLearningPathInputSchema},
  output: {schema: PersonalizedLearningPathOutputSchema},
  prompt: `You are an expert financial literacy tutor. Based on the user's financial background, goals, and current knowledge level, create a personalized learning path that is tailored to the user's needs.

Financial Background: {{{financialBackground}}}
Financial Goals: {{{financialGoals}}}
Current Knowledge Level: {{{currentKnowledgeLevel}}}

Personalized Learning Path:`,
});

const personalizedLearningPathFlow = ai.defineFlow(
  {
    name: 'personalizedLearningPathFlow',
    inputSchema: PersonalizedLearningPathInputSchema,
    outputSchema: PersonalizedLearningPathOutputSchema,
  },
  async input => {
    const {output} = await personalizedLearningPathPrompt(input);
    return output!;
  }
);
