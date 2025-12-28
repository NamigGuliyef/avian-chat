import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Trigger, TriggerSchema } from './model/trigger.schema';
import { TriggerService } from './trigger.service';
import { TriggerController } from './trigger.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trigger.name, schema: TriggerSchema }]),
  ],
  controllers: [TriggerController],
  providers: [TriggerService],
  exports: [MongooseModule],
})
export class TriggerModule {}
