import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  effect,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ChatService } from '../../services/chat.service';
import { CompletionMessage, CompletionOptions } from '@common';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  standalone: true,
  selector: 'azure-open-ai-demo-chat',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatSlideToggleModule,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  @ViewChild('scrollMe')
  private myScrollContainer!: ElementRef;

  audioPlayer = this.initAudioPlayer();

  waitingForResponse = false;

  completionOptionsForm = generateCompletionOptionsForm();

  userMessageControl = new FormControl('');

  enabledTextToSpeech = new FormControl(true);

  //ngrx /redux is foya!
  messagesSignal = signal<CompletionMessage[]>(this.loadMessageHistory());
  messagesChangeEffect = effect(() => {
    this.scrollToBottom();
    this.saveMessageHistory(this.messagesSignal());
  });

  constructor(private chatService: ChatService) {}

  async sendMessage() {
    const userMessage = this.userMessageControl.value;
    if (!userMessage || userMessage.trim() === '') {
      return;
    }
    if (!this.completionOptionsForm.valid) {
      return;
    }
    this.textToSpeech(userMessage, 'en-US-DavisNeural');
    this.updateChatMessages({ role: 'user', content: userMessage });

    this.userMessageControl.setValue('');
    this.waitingForResponse = true;
    this.userMessageControl.disable();
    try {
      const completionMessages = this.generateCompletionMessage();
      const completionOptions = this.generateCompletionOptions();
      const completionResponse = await this.chatService.createChatCompletion(
        completionMessages,
        completionOptions
      );

      await this.textToSpeech(completionResponse.content);
      this.updateChatMessages(completionResponse);
    } catch (err) {
      console.error(err);
    }
    this.waitingForResponse = false;
    this.userMessageControl.enable();
  }

  generateCompletionMessage(): CompletionMessage[] {
    const { systemMessage } = this.completionOptionsForm.value;
    return [
      {
        role: 'system',
        content: systemMessage as string,
      },
      ...this.messagesSignal(),
    ];
  }
  generateCompletionOptions(): CompletionOptions {
    const { stop, ...options } = this.completionOptionsForm.value;
    const stopProp = stop ? stop.split(' ') : undefined;
    return { ...options, stop: stopProp } as CompletionOptions;
  }

  clearMessages() {
    this.pauseSpeech();
    this.messagesSignal.set([]);
    localStorage.removeItem('chatMessages');
  }

  saveMessageHistory(message: CompletionMessage[]) {
    localStorage.setItem('chatMessages', JSON.stringify(message));
  }

  loadMessageHistory(): CompletionMessage[] {
    const storedMessages = localStorage.getItem('chatMessages');
    return storedMessages ? JSON.parse(storedMessages) : [];
  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.myScrollContainer.nativeElement.scrollTop =
          this.myScrollContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.log(err);
      }
    }, 0);
  }

  updateChatMessages(completionMessage: CompletionMessage) {
    this.messagesSignal.mutate((messages) => messages.push(completionMessage));
  }

  async textToSpeech(text: string, speechVoice?: string) {
    if (!this.enabledTextToSpeech.value) {
      return;
    }
    const audioBlob = await this.chatService.textToSpeech(text, speechVoice);
    const audioUrl = URL.createObjectURL(audioBlob);
    this.playAudio(audioUrl);
  }

  audioQueue: string[] = [];
  playAudio(audioUrl: string) {
    if (this.audioPlayer.paused) {
      this.audioPlayer.src = audioUrl;
      this.audioPlayer.play();
    } else {
      this.audioQueue.push(audioUrl);
    }
  }

  initAudioPlayer() {
    const audioPlayer = new Audio();
    audioPlayer.addEventListener('ended', () => {
      if (this.audioQueue.length > 0) {
        const nextAudioUrl = this.audioQueue.shift();
        if (!nextAudioUrl) {
          return;
        }
        this.audioPlayer.src = nextAudioUrl;
        this.audioPlayer.play();
      }
    });
    return audioPlayer;
  }

  pauseSpeech() {
    this.audioPlayer.pause();
  }

  messageContent = '';

  openDialog() {
    this.messageContent = JSON.stringify(
      this.generateCompletionMessage(),
      null,
      2
    );
    const dialog: any = document.getElementById('myDialog');
    dialog.showModal();
  }

  closeDialog() {
    const dialog: any = document.getElementById('myDialog');
    dialog.close();
  }
}
function generateCompletionOptionsForm(): FormGroup {
  return new FormGroup({
    maxTokens: new FormControl(150, [
      Validators.required,
      Validators.min(1),
      Validators.max(4000),
    ]),
    temperature: new FormControl(0.7, [
      Validators.required,
      Validators.min(0),
      Validators.max(1),
    ]),
    topP: new FormControl(0.95, [
      Validators.required,
      Validators.min(0),
      Validators.max(1),
    ]),
    frequencyPenalty: new FormControl(0, [
      Validators.required,
      Validators.min(0),
      Validators.max(2),
    ]),
    presencePenalty: new FormControl(0, [
      Validators.required,
      Validators.min(0),
      Validators.max(2),
    ]),
    stop: new FormControl(''),
    systemMessage: new FormControl(
      'You are an AI assistant that helps people find information.',
      Validators.required
    ),
  });
}
