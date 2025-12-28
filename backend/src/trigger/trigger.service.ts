import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TriggerDocument, Trigger } from './model/trigger.schema';

@Injectable()
export class TriggerService {
  constructor(
    @InjectModel(Trigger.name) private triggerModel: Model<TriggerDocument>,
  ) {}

  async findAll(): Promise<Trigger[]> {
    return this.triggerModel.find().lean();
  }

  async create(payload: Partial<Trigger>): Promise<Trigger> {
    return this.triggerModel.create(payload);
  }
}
