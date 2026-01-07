import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Chatbot, ChatbotSchema } from './model/chatbot.schema';
import { Company, CompanySchema } from '../company/model/company.schema';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { Flow, FlowSchema } from './model/flowmodel/flow.schema';
import { Trigger, TriggerSchema } from './model/triggermodel/trigger.schema';
import { FlowBlock, FlowBlockSchema } from './model/flowmodel/flow-block.schema';
import { FlowButton, FlowButtonSchema } from './model/flowmodel/flow-button.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Chatbot.name,
        schema: ChatbotSchema
      },
      {
        name: Company.name,
        schema: CompanySchema,
      },
      {
        name: Flow.name,
        schema: FlowSchema
      },
      {
        name: Trigger.name,
        schema: TriggerSchema
      },
      {
        name: FlowBlock.name,
        schema: FlowBlockSchema
      },
      {
        name: FlowButton.name,
        schema: FlowButtonSchema
      },
    ]),
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService],
  exports: [MongooseModule],
})
export class ChatbotModule { }
