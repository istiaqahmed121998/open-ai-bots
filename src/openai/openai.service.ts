import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
@Injectable()
export class OpenaiService {
  private readonly logger;
  configuration: Configuration = new Configuration({
    apiKey: process.env.apiKey,
  });
  openai: OpenAIApi;
  constructor() {
    this.logger = new Logger('OpenaiService');
    this.openai = new OpenAIApi(this.configuration);
  }

  async getAnswer(question: string): Promise<string> {
    try {
      const completion = await this.openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `${question}`,
        max_tokens: 250,
        temperature: 0.2,
      });
      return completion?.data.choices?.[0]?.text;
    } catch (error) {
      this.logger.console.error(error);
    }
  }
}
