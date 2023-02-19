import { Logger, Module } from '@nestjs/common';
import { OpenaiController } from './openai.controller';
import { OpenaiService } from './openai.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({ headers: { 'X-Requested-With': 'XMLHttpRequest' } }),
  ],
  controllers: [OpenaiController],
  providers: [OpenaiService],
  exports: [OpenaiService],
})
export class OpenaiModule {}
