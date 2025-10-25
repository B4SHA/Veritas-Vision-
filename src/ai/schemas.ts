
import { z } from 'zod';

// News Sleuth Schemas
export const NewsSleuthInputSchema = z.object({
  articleText: z.string().optional().describe('The text content of the news article to analyze.'),
  articleUrl: z.string().url().optional().describe('The URL of the news article to analyze.'),
  articleHeadline: z.string().optional().describe('The headline of the news article to analyze.'),
  language: z.string().describe('The language of the analysis, specified as a two-letter ISO 639-1 code (e.g., "en", "hi").'),
}).refine(data => data.articleText || data.articleUrl || data.articleHeadline, {
  message: 'One of article text, URL, or headline must be provided.',
});
export type NewsSleuthInput = z.infer<typeof NewsSleuthInputSchema>;

export const NewsSleuthOutputSchema = z.object({
  overallScore: z.number().describe('An overall credibility score for the article (0-100).'),
  verdict: z.string().describe('The final verdict on the news article\'s authenticity.'),
  summary: z.string().describe('A brief summary of the article content.'),
  biases: z.string().describe('A list of potential biases identified in the article.'),
  flaggedContent: z.array(z.string()).describe('Specific content flagged for low credibility.'),
  reasoning: z.string().describe('The reasoning behind the credibility assessment.'),
  sources: z.array(z.string()).optional().describe('List of external sources consulted.'),
});
export type NewsSleuthOutput = z.infer<typeof NewsSleuthOutputSchema>;
export type NewsSleuthError = { error: string; details?: string };


// Image Verifier Schemas
export const ImageVerifierInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().describe('The language of the analysis, specified as a two-letter ISO 639-1 code (e.g., "en", "hi").'),
});

const TextAnalysisSchema = z.object({
    detectedText: z.string().describe("The exact text extracted from the image."),
    analysis: z.string().describe("A detailed report of your findings about the text."),
  });
  

export const ImageVerifierOutputSchema = z.object({
    verdict: z.enum(['Likely Authentic', 'Likely AI-Generated/Manipulated', 'Uncertain']).describe("The final judgment on the image's authenticity."),
    confidenceScore: z.number().describe("A score from 0-100 indicating the confidence in the verdict."),
    isAiGenerated: z.boolean().describe("Set to true if the image is likely AI-generated."),
    isManipulated: z.boolean().describe("Set to true if the image is likely digitally manipulated."),
    isMisleadingContext: z.boolean().describe("Set to true if the image is presented in a misleading context."),
    context: z.string().describe("Context about the image, if found."),
    report: z.string().describe("A detailed report justifying the forensics verdict."),
    textAnalysis: TextAnalysisSchema.optional().describe("Analysis of any text detected in the image."),
});

export type ImageVerifierInput = z.infer<typeof ImageVerifierInputSchema>;
export type ImageVerifierOutput = z.infer<typeof ImageVerifierOutputSchema>;
export type ImageVerifierError = { error: string; details?: string };


// Audio Authenticator Schemas
export const AudioAuthenticatorInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    language: z.string().describe('The language of the analysis, specified as a two-letter ISO 639-1 code (e.g-en", "hi").'),
});

export const AudioAuthenticatorOutputSchema = z.object({
    overallScore: z.number().describe("A confidence score (0-100) on the audio's authenticity."),
    verdict: z.enum(['Likely Authentic', 'Potential AI/Manipulation', 'Uncertain']).describe("Your definitive final judgment."),
    summary: z.string().describe("A concise, single-sentence summary of your primary technical findings and the core reason for your verdict."),
    reasoning: z.string().describe("Detailed, granular reasoning behind your technical verdict, analyzing criteria like background noise, speaker tone, cadence, and frequency spectrum."),
    detectedText: z.string().nullable().describe("The full, precise transcription of the speech. If no speech is detected, this is null."),
    speechAnalysis: z.string().nullable().describe("Scrutiny of the transcribed text for misleading content. If no speech is detected, this is null."),
  });

export type AudioAuthenticatorInput = z.infer<typeof AudioAuthenticatorInputSchema>;
export type AudioAuthenticatorOutput = z.infer<typeof AudioAuthenticatorOutputSchema>;
export type AudioAuthenticatorError = { error: string; details?: string };


// Video Integrity Schemas
export const VideoIntegrityInputSchema = z.object({
    videoDataUri: z
      .string()
      .describe(
        "A video file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      ),
    language: z.string().describe('The language of the analysis, specified as a two-letter ISO 639-1 code (e.g., "en", "hi").'),
  });
  
  const AudioTextAnalysisSchema = z.object({
    detectedText: z.string().describe("The full transcription of the speech."),
    analysis: z.string().describe("A detailed report of your findings about the spoken content, explaining why it might be credible, fake, or misleading."),
  });
  
  const VideoIntegrityAnalysisSchema = z.object({
    confidenceScore: z.number().describe("A confidence score (0-100) in the video's authenticity."),
    summary: z.string().describe("A brief summary of your forensic analysis findings."),
    deepfake: z.boolean().describe("Set to true if deepfake elements are detected, otherwise false."),
    videoManipulation: z.boolean().describe("Set to true if general video manipulations (CGI, edits) are detected, otherwise false."),
    syntheticVoice: z.boolean().describe("Set to true if voice cloning or synthetic speech is detected, otherwise false."),
    fullyAiGenerated: z.boolean().describe("Set to true if the entire video appears to be AI-generated, otherwise false."),
    satireParody: z.boolean().describe("Set to true if the video is likely intended as satire or parody, otherwise false."),
    misleadingContext: z.boolean().describe("Set to true if the video is presented in a misleading context, otherwise false."),
    audioTextAnalysis: AudioTextAnalysisSchema.optional().describe("Analysis of the spoken text, if any is detected."),
  });
  
  export const VideoIntegrityOutputSchema = z.object({
    analysis: VideoIntegrityAnalysisSchema,
  });
  
  export type VideoIntegrityInput = z.infer<typeof VideoIntegrityInputSchema>;
  export type VideoIntegrityOutput = z.infer<typeof VideoIntegrityOutputSchema>;
  export type VideoIntegrityError = { error: string; details?: string };
