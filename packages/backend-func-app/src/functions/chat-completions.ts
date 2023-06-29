import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { openAiService } from '../services/open-ai.service';
import { CompletionMessage, CompletionOptions } from '@common';
import { encode } from 'gpt-3-encoder';

export async function chatCompletions(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  const body = (await request.json()) as {
    messages: CompletionMessage[];
    options: CompletionOptions;
  };

  const encoded = encode(JSON.stringify(body.messages));
  context.log('num of tokens', encoded.length);

  try {
    const completion = await openAiService.chatCompletion(
      body.messages,
      body.options
    );
    return {
      body: JSON.stringify(completion),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    context.error(error);
  }
}
app.http('chat-completions', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: chatCompletions,
});
