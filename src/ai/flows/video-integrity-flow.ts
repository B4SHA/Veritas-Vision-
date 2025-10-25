
'use server';
/**
 * @fileOverview A video integrity analysis AI agent.
 *
 * This file defines the server-side logic for the Video Integrity feature, which
 * analyzes videos for authenticity and manipulation using a Genkit flow.
 */

import {ai} from '@/ai/genkit';
import {
    VideoIntegrityInputSchema,
    VideoIntegrityOutputSchema,
    type VideoIntegrityInput,
    type VideoIntegrityOutput,
    type VideoIntegrityError,
} from '@/ai/schemas';
import { googleAI } from '@genkit-ai/google-genai';


const prompt = ai.definePrompt({
    name: 'videoIntegrityPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: VideoIntegrityInputSchema },
    output: { schema: VideoIntegrityOutputSchema },
    prompt: `You are a multi-disciplinary expert in digital forensics, combining video analysis with audio and text investigation.

Your task is to perform a two-part analysis on the provided video.
  
CRITICAL: You MUST generate the entire report (the 'summary' and 'audioTextAnalysis.analysis' fields) in the following language: {{language}}. If no language is provided, default to English. The boolean fields and 'detectedText' field should NOT be translated.

  **Part 1: Visual and Audio Forensics**
  Analyze the video for authenticity. You will determine if it is a deepfake, used in a misleading context, manipulated, satire/parody, contains a synthetic voice, or is fully AI-generated.
  
  **Visual Analysis:**
  - Look for visual artifacts, unnatural movements, inconsistent lighting, and other signs of manipulation.
  
  **Audio Analysis (CRITICAL for Synthetic Voice Detection):**
  - Listen for audio artifacts that suggest a synthetic voice. Pay extremely close attention to:
    - **Cadence and Intonation:** Is the speech pattern unnatural, too perfect, or lacking normal human emotion?
    - **Background Noise:** Is the audio unnaturally sterile or clean, lacking the subtle ambient sounds of a real recording?
    - **Digital Artifacts:** Are there any slight robotic tones, distortions, or unusual frequencies?
    - **Breathing and Pauses:** Are breaths non-existent or do they sound unnatural?
  
  **Contextual Analysis:**
  - Use your internal knowledge to determine if the video is being presented in a misleading context (e.g., wrong time or place).
  - Provide a confidence score for your overall analysis. The confidence score should reflect how certain you are about your findings, whether the video is real or fake.
  - Write a short summary of your forensic analysis. Your summary MUST be consistent with your findings (e.g., if 'syntheticVoice' is true, do not describe the audio as "natural-sounding").

  **Part 2: Spoken Text Analysis (If Applicable)**
  CRITICAL: Listen to the audio track of the video to determine if it contains any discernible speech.
  - If NO speech is detected, omit the 'audioTextAnalysis' field from your output.
  - If speech IS detected, you MUST:
    a. Populate 'audioTextAnalysis.detectedText' with the full transcription of the speech.
    b. Switch roles to a fake news analyst. Scrutinize the transcribed text. Does it contain misinformation, conspiracy theories, or manipulative language?
    c. Populate 'audioTextAnalysis.analysis' with a detailed report of your findings about the spoken content, explaining why it might be credible, fake, or misleading.

  Analyze the following video:
  {{media url=videoDataUri}}
`
});


const videoIntegrityFlow = ai.defineFlow(
    {
        name: 'videoIntegrityFlow',
        inputSchema: VideoIntegrityInputSchema,
        outputSchema: VideoIntegrityOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);

export async function videoIntegrityAnalysis(
  input: VideoIntegrityInput
): Promise<VideoIntegrityOutput | VideoIntegrityError> {
  try {
    const result = await videoIntegrityFlow(input);
    return result;
  } catch (error: any) {
    console.error("Error in videoIntegrityAnalysis flow:", error);
    return {
      error: 'FLOW_EXECUTION_FAILED',
      details: error.message || 'The AI model failed to execute.',
    };
  }
}
