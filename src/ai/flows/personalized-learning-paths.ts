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
    .describe('User’s financial background and experience.'),
  financialGoals: z.string().describe('User’s financial goals and aspirations.'),
  currentKnowledgeLevel: z
    .enum(['principiante', 'intermedio', 'avanzado'])
    .describe('User’s current understanding of financial concepts.'),
});

export type PersonalizedLearningPathInput = z.infer<
  typeof PersonalizedLearningPathInputSchema
>;

const QuizQuestionSchema = z.object({
  question: z.string().describe('The quiz question.'),
  options: z.array(z.string()).describe('A list of possible answers.'),
  correctAnswer: z.string().describe('The correct answer from the options.'),
});

const LessonSchema = z.object({
  title: z.string().describe('The title of the lesson.'),
  detailedContent: z.string().describe('A clear and simple explanation of the lesson content.'),
  practicalTips: z.array(z.string()).describe('A list of short, actionable tips.'),
  realExample: z.string().describe('A practical, real-life example of the concept.'),
  quiz: z.array(QuizQuestionSchema).describe('A short quiz with one or two questions to reinforce learning.'),
});

const ModuleSchema = z.object({
  title: z.string().describe('The title of the learning module.'),
  lessons: z.array(LessonSchema).describe('A list of lessons within the module, each with detailed content.'),
});

const PersonalizedLearningPathOutputSchema = z.object({
  learningPath: z
    .array(ModuleSchema)
    .describe('A personalized learning path with modules and detailed lessons tailored to the user’s needs.'),
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
  prompt: `You are an expert financial literacy tutor. Based on the user's financial background, goals, and current knowledge level, create a personalized learning path that is tailored to the user's needs. Organize the content into modules, and each module should contain a list of lessons.

For each lesson, you must generate the following:
1.  **title**: A clear and concise title for the lesson.
2.  **detailedContent**: A simple and easy-to-understand explanation of the main concept.
3.  **practicalTips**: A list of 2-3 short, actionable tips.
4.  **realExample**: A practical, real-life example that illustrates the concept.
5.  **quiz**: A short quiz with 1 or 2 multiple-choice questions to reinforce learning. Each question must have a 'question', a list of 'options', and the 'correctAnswer'.

The user's level is: {{{currentKnowledgeLevel}}}.
- If 'principiante', focus on basic concepts like saving, budgeting, debt, and interest.
- If 'intermedio', focus on practical financial management like credit cards, expense control, and financial goals.
- If 'avanzado', focus on long-term planning like compound interest and basic investing.

Financial Background: {{{financialBackground}}}
Financial Goals: {{{financialGoals}}}

Generate a structured learning path with several modules. Each module must have a clear title and a list of detailed lessons as specified above.`,
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
