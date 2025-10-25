
'use server';
/**
 * @fileOverview An audio authentication AI agent.
 *
 * This file defines the server-side logic for the Audio Authenticator feature, which
 * analyzes audio files for authenticity using a Genkit flow.
 */

import {ai} from '@/ai/genkit';
import {
    AudioAuthenticatorInputSchema,
    AudioAuthenticatorOutputSchema,
    type AudioAuthenticatorInput,
    type AudioAuthenticatorOutput,
    type AudioAuthenticatorError,
} from '@/ai/schemas';
import { googleAI } from '@genkit-ai/google-genai';

const prompt = ai.definePrompt({
    name: 'audioAuthenticatorPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: AudioAuthenticatorInputSchema },
    output: { schema: AudioAuthenticatorOutputSchema },
    prompt: `You are an expert in digital forensics with a highly specialized and vigilant focus on detecting advanced AI-generated and manipulated audio (including outputs from state-of-the-art platforms like ElevenLabs) and a secondary, equally critical, specialty in misinformation detection.

    Your task is to perform a two-part, highly detailed analysis on the provided audio clip.
    
    CRITICAL: You MUST generate the entire report (the 'reasoning', 'speechAnalysis') in the following language: {{language}}. If no language is provided, default to English. The 'verdict', 'overallScore', 'summary', and 'detectedText' fields should NOT be translated.
    
    Audio: {{media url=audioDataUri}}
    
    Your output MUST be a single JSON object with the following fields and structures:
    
    Part 1: Audio Forensics - Authenticity Assessment
    You will analyze the audio clip's technical properties to determine if it is authentic or has been manipulated/AI-generated. Prioritize false positives over false negatives; if you detect any subtle signs of AI generation, synthesis, or manipulation, you MUST select 'Potential AI/Manipulation'.
    
    overallScore: A confidence score (0-100) on the audio's authenticity, where lower scores indicate higher suspicion of manipulation.
    
    verdict: Your definitive final judgment ('Likely Authentic', 'Potential AI/Manipulation', or 'Uncertain').
    
    summary: A concise, single-sentence summary of your primary technical findings and the core reason for your verdict.
    
    reasoning: Detailed, granular reasoning behind your technical verdict. You MUST meticulously analyze the following advanced detection criteria. Provide concrete examples or observations for each point you mention:
    
    Background Noise/Room Tone: Look for an unnatural absence of natural background variation, repetitive loops, overly consistent/clean room tone, or noise that seems digitally added/over-processed.
    
    Speaker Tone & Prosody: Examine for subtle robotic tendencies, overly perfect or inconsistent emotional inflection, unnatural emphasis, or a lack of genuine human vocal imperfections (e.g., natural breath sounds, slight pitch drift, vocal fry, or subtle throat clearings).
    
    Cadence & Pacing: Assess for unnaturally consistent rhythm, overly precise pauses, or unusual timing that lacks human spontaneity. Identify if speech feels "stitched together" or lacks natural flow.
    
    Frequency Spectrum & Audio Fingerprinting: Conduct a spectral analysis for tell-tale signs of digital synthesis, such as unusual frequency cutoffs, overly smooth/flat spectral profiles, repetitive spectral patterns, or a lack of the rich, complex harmonic content typical of natural human speech.
    
    Overall Cohesion & "Too Perfect" Syndrome: Explicitly comment if the audio seems "too perfect" or unnaturally clean compared to a genuine recording of similar content and context. Highlight any instances where the audio lacks the organic imperfections expected in real-world recordings.
    
    Part 2: Content and Speech Analysis - Misinformation Detection
    CRITICAL: Listen to the content of the audio to determine if there is any discernible speech.
    
    If NO speech is detected (e.g., it is just music, noise, or silence), set detectedText and speechAnalysis to null.
    
    If speech IS detected, you MUST:
    
    detectedText: Populate this field with the full, precise transcription of the speech.
    
    speechAnalysis: Switch roles to a misinformation analyst. Scrutinize the transcribed text.
    
    If misleading content is identified: Explain what the misleading information is, why it is misleading, and how it could potentially manipulate perception (e.g., quoting song lyrics as a real statement, satire presented as fact, factual statements taken out of context).
    
    If the speech is neutral/factual: Respond with the structure: "There are no immediately misleading contexts in the transcript, but the content discusses..." and provide a brief, objective summary of the topic.`
});

const audioAuthenticatorFlow = ai.defineFlow(
    {
        name: 'audioAuthenticatorFlow',
        inputSchema: AudioAuthenticatorInputSchema,
        outputSchema: AudioAuthenticatorOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);

export async function audioAuthenticatorAnalysis(
  input: AudioAuthenticatorInput
): Promise<AudioAuthenticatorOutput | AudioAuthenticatorError> {
  try {
    const result = await audioAuthenticatorFlow(input);
    return result;
  } catch (error: any) {
    console.error("Error in audioAuthenticatorAnalysis flow:", error);
    return {
      error: 'FLOW_EXECUTION_FAILED',
      details: error.message || 'The AI model failed to execute.',
    };
  }
}
