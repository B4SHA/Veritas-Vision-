
'use server';
/**
 * @fileOverview An image verification AI agent.
 *
 * This file defines the server-side logic for the Image Verifier feature, which
 * analyzes images for authenticity and manipulation using a Genkit flow.
 */

import {ai} from '@/ai/genkit';
import {
    ImageVerifierInputSchema,
    ImageVerifierOutputSchema,
    type ImageVerifierInput,
    type ImageVerifierOutput,
    type ImageVerifierError,
} from '@/ai/schemas';
import { googleAI } from '@genkit-ai/google-genai';

const prompt = ai.definePrompt({
    name: 'imageVerifierPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: ImageVerifierInputSchema },
    output: { schema: ImageVerifierOutputSchema },
    prompt: `You are a multi-disciplinary expert in digital forensics, combining the skills of an image analyst and a fake news investigator.

  Your task is to perform a two-part analysis on the provided image.

  CRITICAL: You MUST generate the entire report (the 'report', 'context', and 'textAnalysis.analysis' fields) in the following language: {{language}}. If no language is provided, default to English. The 'verdict' and 'detectedText' fields should NOT be translated.
  
  **Part 1: Image Forensics**
  Analyze the image for authenticity. Look for signs of AI generation or digital manipulation.
  Characteristics of AI-generated or manipulated images may include:
  - Unnatural textures or details (e.g., skin, hair, backgrounds).
  - Inconsistent lighting, shadows, or reflections.
  - Anatomical impossibilities (e.g., extra fingers, strange proportions).
  - Warping or artifacts around edited areas.
  
  Based on the image forensics, you will:
  1. Determine if the image is 'Likely AI-Generated/Manipulated', 'Likely Authentic', or 'Uncertain'.
  2. Provide a confidence score (0-100) for your verdict.
  3. Explicitly set 'isAiGenerated' and 'isManipulated' booleans.
  4. Use your internal knowledge and reverse-image-search capabilities to find context for the image. In the 'context' field, describe what the image depicts (e.g., "A photo of the Eiffel Tower at night") or state that no context could be found.
  5. Based on the context, determine if the image could be used in a misleading way (e.g., an old photo presented as new, a photo from a different location, etc.). Set the 'isMisleadingContext' boolean accordingly.
  6. Provide a detailed 'report' justifying your forensics verdict and all your findings.

  **Part 2: Text Analysis (If Applicable)**
  CRITICAL: First, examine the image to see if it contains any significant text (e.g., a headline, a sign, a social media post screenshot).
  - If NO text is detected, omit the 'textAnalysis' field from your output.
  - If text IS detected, you MUST:
    a. Populate 'textAnalysis.detectedText' with the exact text you extracted from the image.
    b. Switch roles to a fake news analyst. Scrutinize the 'detectedText'. Is it a known fake news headline? Does it contain sensational language, logical fallacies, or misinformation?
    c. Populate 'textAnalysis.analysis' with a detailed report of your findings about the text, explaining why it might be authentic, fake, or misleading.

  Image for analysis: {{media url=imageDataUri}}`
});

const imageVerifierFlow = ai.defineFlow(
    {
        name: 'imageVerifierFlow',
        inputSchema: ImageVerifierInputSchema,
        outputSchema: ImageVerifierOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);

export async function imageVerifierAnalysis(
  input: ImageVerifierInput
): Promise<ImageVerifierOutput | ImageVerifierError> {
  try {
    const result = await imageVerifierFlow(input);
    return result;
  } catch (error: any) {
    console.error("Error in imageVerifierAnalysis flow:", error);
    return {
      error: 'FLOW_EXECUTION_FAILED',
      details: error.message || 'The AI model failed to execute.',
    };
  }
}
