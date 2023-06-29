import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CompletionMessage, CompletionOptions } from '@common';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  //private apiUrl = 'https://next-function-app.azurewebsites.net/api';
  private apiUrl = 'http://localhost:7071/api';
  private chatCompletionsEndpoint = `${this.apiUrl}/chat-completions`;
  private textToSpeechEndpoint = `${this.apiUrl}/text-to-speech`;
  private extractFileDataEndpoint = `${this.apiUrl}/extract-file-data`;

  constructor(private http: HttpClient) {}
  async createChatCompletion(
    messages: CompletionMessage[],
    options: CompletionOptions
  ): Promise<CompletionMessage> {
    return firstValueFrom(
      this.http.post<CompletionMessage>(this.chatCompletionsEndpoint, {
        messages,
        options,
      })
    );
  }

  async textToSpeech(text: string, speechVoice?: string): Promise<Blob> {
    return firstValueFrom(
      this.http.post(
        this.textToSpeechEndpoint,
        {
          text,
          speechVoice,
        },
        { responseType: 'blob' }
      )
    );
  }

  async extractFileData(file: File): Promise<unknown> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return firstValueFrom(
      this.http.post(this.extractFileDataEndpoint, formData)
    );
  }
}
