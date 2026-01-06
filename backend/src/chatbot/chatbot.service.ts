import { Injectable } from '@nestjs/common';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { UpdateChatbotDto } from './dto/update-chatbot.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Chatbot } from './model/chatbot.schema';
import { Model, Types } from 'mongoose';
import { CreateFlowDto } from './dto/flowdto/create-flow.dto';
import { Flow } from './model/flowmodel/flow.schema';
import { CreateTriggerDto } from './dto/triggerdto/create-trigger.dto';
import { Trigger } from './model/triggermodel/trigger.schema';
import { FlowBlock } from './model/flowmodel/flow-block.schema';
import { FlowButton } from './model/flowmodel/flow-button.schema';
import { FlowBlockDto } from './dto/flowdto/flow-block.dto';
import { FlowButtonDto } from './dto/flowdto/flow-button.dto';

@Injectable()
export class ChatbotService {
  constructor(
    @InjectModel(Chatbot.name) private readonly chatbotModel: Model<Chatbot>,
    @InjectModel(Flow.name) private readonly flowModel: Model<Flow>,
    @InjectModel(Trigger.name) private readonly triggerModel: Model<Trigger>,
    @InjectModel(FlowBlock.name) private readonly flowBlockModel: Model<FlowBlock>,
    @InjectModel(FlowButton.name) private readonly flowButtonModel: Model<FlowButton>,
  ) { }
  create(createChatbotDto: CreateChatbotDto) {
    const chatbot = this.chatbotModel.create(createChatbotDto);
    return chatbot;
  }

  findAll() {
    const chatbots = this.chatbotModel.find().exec();
    return chatbots;
  }

  findAllByCompanyId(companyId: Types.ObjectId) {
    const chatbots = this.chatbotModel.find({ companyId }).populate('companyId').exec();
    return chatbots;
  }

  findOne(id: Types.ObjectId) {
    const chatbot = this.chatbotModel.findById(id).exec();
    return chatbot;
  }

  update(id: Types.ObjectId, updateChatbotDto: UpdateChatbotDto) {
    const chatbot = this.chatbotModel.findByIdAndUpdate(id, updateChatbotDto, { new: true }).exec();
    return chatbot;
  }

  remove(id: Types.ObjectId) {
    const chatbot = this.chatbotModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
    return chatbot;
  }

  // flow related methods can be added here
  createFlow(flowData: CreateFlowDto) {
    const flow = new this.flowModel(flowData);
    this.chatbotModel.updateOne(
      { _id: flowData.chatbotId },
      { $push: { flowIds: flow._id } }
    ).exec();
    flow.save();
    return flow;
  }


  updateFlow(flowId: Types.ObjectId, flowData: Partial<CreateFlowDto>) {
    return this.flowModel.findByIdAndUpdate(flowId, flowData, { new: true }).exec();
  }


  getFlowById(flowId: Types.ObjectId) {
    return this.flowModel.findById(flowId).exec();
  }


  getFlowByChatBotId(chatbotId: Types.ObjectId) {
    return this.flowModel.findOne({ chatbotId }).exec();
  }


  deleteFlow(flowId: Types.ObjectId) {
    const deleteFlow = this.flowModel.findByIdAndDelete(flowId).exec();
    this.chatbotModel.updateOne(
      { flowIds: flowId },
      { $pull: { flowIds: flowId } }
    ).exec();
    return deleteFlow;
  }


  // trigger related methods can be added here

  createTrigger(data: CreateTriggerDto) {
    const trigger = new this.triggerModel(data);
    this.chatbotModel.updateOne(
      { _id: data.chatbotId },
      { $push: { triggerIds: trigger._id } }
    ).exec();
    trigger.save();
    return trigger;
  }


  updateTrigger(triggerId: Types.ObjectId, data: Partial<CreateTriggerDto>) {
    return this.triggerModel.findByIdAndUpdate(triggerId, data, { new: true }).exec();
  }


  getTriggerById(triggerId: Types.ObjectId) {
    return this.triggerModel.findById(triggerId).exec();
  }


  deleteTrigger(triggerId: Types.ObjectId) {
    const deleteTrigger = this.triggerModel.findByIdAndDelete(triggerId).exec();
    this.chatbotModel.updateOne(
      { triggerIds: triggerId },
      { $pull: { triggerIds: triggerId } }
    ).exec();
    return deleteTrigger;
  }

  
  // flow-block related methods can be added here
  createFlowBlock(data: FlowBlockDto) {
    const flowBlock = new this.flowBlockModel(data);
    this.flowModel.findByIdAndUpdate(
      data.targetFlowId,
      { $push: { blocks: flowBlock._id } }
    ).exec();
    flowBlock.save();
    return flowBlock;
  }


  updateFlowBlock(flowBlockId: Types.ObjectId, data: Partial<FlowBlockDto>) {
    return this.flowBlockModel.findByIdAndUpdate(flowBlockId, data, { new: true }).exec();
  }
  getFlowBlockById(flowBlockId: Types.ObjectId) {
    return this.flowBlockModel.findById(flowBlockId).exec();
  }
  deleteFlowBlock(flowBlockId: Types.ObjectId) {
    return this.flowBlockModel.findByIdAndDelete(flowBlockId).exec();
  }



  // flow-button related methods can be added here
  createFlowButton(data: FlowButtonDto) {
    const flowButton = new this.flowButtonModel(data);
    this.flowBlockModel.findByIdAndUpdate(
      data.goToFlowId,
      { $push: { buttons: flowButton._id } }
    ).exec();
    flowButton.save();
    return flowButton;
  }
  updateFlowButton(flowButtonId: Types.ObjectId, data: Partial<FlowButtonDto>) {
    return this.flowButtonModel.findByIdAndUpdate(flowButtonId, data, { new: true }).exec();
  }
  getFlowButtonById(flowButtonId: Types.ObjectId) {
    return this.flowButtonModel.findById(flowButtonId).exec();
  }
  deleteFlowButton(flowButtonId: Types.ObjectId) {
    return this.flowButtonModel.findByIdAndDelete(flowButtonId).exec();
  }
}
