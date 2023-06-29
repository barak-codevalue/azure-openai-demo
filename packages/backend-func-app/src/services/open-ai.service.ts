import { CompletionMessage, CompletionOptions } from '@common';
import { Configuration, OpenAIApi } from 'azure-openai';

const openai = new OpenAIApi(
  new Configuration({
    azure: {
      apiKey: process.env.OPEN_AI_API_KEY,
      endpoint: process.env.AZURE_OPEN_AI_ENDPOINT,
      deploymentName: 'next-gpt',
    },
  })
);

async function chatCompletion(
  messages: CompletionMessage[],
  options: CompletionOptions
): Promise<CompletionMessage> {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      stop: options.stop,
      messages,
    });
    return response.data.choices?.[0]?.message;
  } catch (error) {
    throw error.response.data;
  }
}

export const openAiService = {
  chatCompletion,
};
