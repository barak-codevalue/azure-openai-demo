import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { speechService } from '../services/speech.service';

export async function textToSpeech(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  const body = (await request.json()) as { text: string; speechVoice?: string };

  try {
    const audioFile = await speechService.textToSpeech(
      body.text,
      body.speechVoice
    );

    return {
      body: audioFile,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-disposition': 'attachment; filename=audio.wav',
      },
    };
  } catch (error) {
    context.error(error);
    return {
      status: 500,
    };
  }
}
app.http('text-to-speech', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: textToSpeech,
});
