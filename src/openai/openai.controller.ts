import { Body, Controller, Post } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Controller('openai')
export class OpenaiController {
  constructor(private openaiService: OpenaiService) {}

  @Post('/')
  async getAnswer(@Body('prompt') q: string) {
    const a = await this.openaiService.getAnswer(q);
    return a;
  }
}
