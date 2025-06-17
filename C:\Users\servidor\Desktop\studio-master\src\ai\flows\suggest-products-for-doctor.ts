
'use server';
/**
 * @fileOverview Suggests products to promote to a doctor based on stock levels and doctor's interests.
 *
 * - suggestProductsForDoctor - A function that suggests products for a doctor.
 * - SuggestProductsForDoctorInput - The input type for the suggestProductsForDoctor function.
 * - SuggestProductsForDoctorOutput - The return type for the suggestProductsForDoctor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestProductsForDoctorInputSchema = z.object({
  doctorId: z.string().describe('The ID of the doctor to suggest products for.'),
  cycleId: z.string().describe('The ID of the current marketing cycle.'),
  availableProducts: z
    .array(z.string())
    .describe('A list of available product names, their stock levels, and descriptions.'),
  doctorInterests: z
    .string()
    .describe('A description of the doctor\'s interests and specializations.'),
});
export type SuggestProductsForDoctorInput = z.infer<
  typeof SuggestProductsForDoctorInputSchema
>;

const SuggestProductsForDoctorOutputSchema = z.object({
  suggestedProducts: z
    .array(z.string())
    .describe('A list of product names to promote to the doctor.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the product suggestions.'),
});
export type SuggestProductsForDoctorOutput = z.infer<
  typeof SuggestProductsForDoctorOutputSchema
>;

export async function suggestProductsForDoctor(
  input: SuggestProductsForDoctorInput
): Promise<SuggestProductsForDoctorOutput> {
  return suggestProductsForDoctorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestProductsForDoctorPrompt',
  input: {schema: SuggestProductsForDoctorInputSchema},
  output: {schema: SuggestProductsForDoctorOutputSchema},
  prompt: `You are an expert marketing assistant who specializes in suggesting the best products to promote to doctors.

You will be given the following information:
- A list of available products, their stock levels, and their descriptions.
- The doctor's interests and specializations.

Based on this information, you will suggest a list of products to promote to the doctor and explain your reasoning.
Consider product availability (stock levels) and how well they align with the doctor's interests.

Available Products:
{{#each availableProducts}}
- {{{this}}}
{{/each}}

Doctor Interests: {{{doctorInterests}}}

Please provide the suggested products and your reasoning in the following format:

Suggested Products: [product1, product2, ...]
Reasoning: ...`,
});

const suggestProductsForDoctorFlow = ai.defineFlow(
  {
    name: 'suggestProductsForDoctorFlow',
    inputSchema: SuggestProductsForDoctorInputSchema,
    outputSchema: SuggestProductsForDoctorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
