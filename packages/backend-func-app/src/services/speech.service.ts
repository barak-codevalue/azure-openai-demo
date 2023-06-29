import {
  AudioConfig,
  ResultReason,
  SpeechConfig,
  SpeechSynthesizer,
} from 'microsoft-cognitiveservices-speech-sdk';

async function textToSpeech(
  text: string,
  speechVoice?: string
): Promise<Buffer> {
  const speechConfig = SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY,
    process.env.AZURE_SPEECH_REGION
  );
  speechConfig.speechSynthesisVoiceName = speechVoice ?? 'en-US-JennyNeural';

  const audioFile = 'speak-audio.wav';
  const audioConfig = AudioConfig.fromAudioFileOutput(audioFile);

  const audioBuffer = await speakTextAsync(text, speechConfig, audioConfig);
  return audioBuffer;
}

function speakTextAsync(
  text: string,
  speechConfig: SpeechConfig,
  audioConfig: AudioConfig
): Promise<Buffer> {
  const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      (result) => {
        if (!result) {
          return reject('Nothing synthesized.');
        }
        if (result.reason === ResultReason.SynthesizingAudioCompleted) {
          console.log('synthesis finished.');
          resolve(Buffer.from(result.audioData));
        } else {
          reject(result.errorDetails);
        }
        synthesizer.close();
      },
      (error) => {
        reject(error);
      }
    );
  });
}

export const speechService = {
  textToSpeech,
};
