import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { UpdateChatbotDto } from './dto/update-chatbot.dto';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { Types } from 'mongoose';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateFlowDto } from './dto/flowdto/create-flow.dto';
import { UpdateFlowDto } from './dto/flowdto/update-flow.dto';
import { CreateTriggerDto } from './dto/triggerdto/create-trigger.dto';
import { UpdateTriggerDto } from './dto/triggerdto/update-trigger.dto';
import { FlowBlockDto } from './dto/flowdto/flow-block.dto';
import { FlowButtonDto } from './dto/flowdto/flow-button.dto';

@ApiTags('chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) { }

  @ApiOperation({ summary: 'Create a new chatbot' })
  @ApiBody({ type: CreateChatbotDto })
  @Post()
  create(@Body() createChatbotDto: CreateChatbotDto) {
    return this.chatbotService.create(createChatbotDto);
  }

  @ApiOperation({ summary: 'Get all chatbots' })
  @Get()
  findAll() {
    return this.chatbotService.findAll();
  }

  @ApiOperation({ summary: 'Get chatbots by company ID' })
  @Get()
  findAllByCompanyId(@Param('companyId') companyId: Types.ObjectId) {
    return this.chatbotService.findAllByCompanyId(companyId);
  }


  @ApiOperation({ summary: 'Get a chatbot by ID' })
  @Get(':id')
  findOne(@Param('id') id: Types.ObjectId) {
    return this.chatbotService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a chatbot by ID' })
  @ApiBody({ type: UpdateChatbotDto })
  @Patch(':id')
  update(@Param('id') id: Types.ObjectId, @Body() updateChatbotDto: UpdateChatbotDto) {
    return this.chatbotService.update(id, updateChatbotDto);
  }

  @ApiOperation({ summary: 'Delete a chatbot by ID' })
  @Delete(':id')
  remove(@Param('id') id: Types.ObjectId) {
    return this.chatbotService.remove(id);
  }

  // flow related endpoints can be added here
  @ApiOperation({ summary: 'Create a new flow' })
  @ApiBody({ type: CreateFlowDto })
  @Post('flow')
  createFlow(@Body() flowData: CreateFlowDto) {
    return this.chatbotService.createFlow(flowData);
  }

  @ApiOperation({ summary: 'Update a flow by ID' })
  @ApiBody({ type: UpdateFlowDto })
  @Patch('flow/:flowId')
  updateFlow(@Param('flowId') flowId: Types.ObjectId, @Body() flowData: UpdateFlowDto) {
    return this.chatbotService.updateFlow(flowId, flowData);
  }

  @ApiOperation({ summary: 'Get a flow by ID' })
  @Get('flow/:flowId')
  getFlowById(@Param('flowId') flowId: Types.ObjectId) {
    return this.chatbotService.getFlowById(flowId);
  }

  @ApiOperation({ summary: 'Delete a flow by ID' })
  @Delete('flow/:flowId')
  deleteFlow(@Param('flowId') flowId: Types.ObjectId) {
    return this.chatbotService.deleteFlow(flowId);
  }

  // trigger related endpoints can be added here

  @ApiOperation({ summary: 'Create a new trigger' })
  @ApiBody({ type: CreateTriggerDto })
  @Post('trigger')
  createTrigger(@Body() data: CreateTriggerDto) {
    return this.chatbotService.createTrigger(data);
  }

  @ApiOperation({ summary: 'Update a trigger by ID' })
  @ApiBody({ type: UpdateTriggerDto })
  @Patch('trigger/:triggerId')
  updateTrigger(@Param('triggerId') triggerId: Types.ObjectId, @Body() data: UpdateTriggerDto) {
    return this.chatbotService.updateTrigger(triggerId, data);
  }

  @ApiOperation({ summary: 'Get a trigger by ID' })
  @Get('trigger/:triggerId')
  getTriggerById(@Param('triggerId') triggerId: Types.ObjectId) {
    return this.chatbotService.getTriggerById(triggerId);
  }

  @ApiOperation({ summary: 'Delete a trigger by ID' })
  @Delete('trigger/:triggerId')
  deleteTrigger(@Param('triggerId') triggerId: Types.ObjectId) {
    return this.chatbotService.deleteTrigger(triggerId);
  }

  @ApiOperation({ summary: "Get all flow blocks" })
  @Get('flow-blocks/:flowBlockId')
  getAllFlowBlockById(@Param('flowBlockId') flowBlockId: Types.ObjectId) {
    return this.chatbotService.getFlowBlockById(flowBlockId);
  }

  @ApiOperation({ summary: "Update a flow block by ID" })
  @ApiBody({ type: FlowBlockDto })
  @Patch('flow-blocks/:flowBlockId')
  updateFlowBlock(@Param('flowBlockId') flowBlockId: Types.ObjectId, @Body() data: Partial<FlowBlockDto>) {
    return this.chatbotService.updateFlowBlock(flowBlockId, data);
  }

  @ApiOperation({ summary: "Create a new flow block" })
  @ApiBody({ type: FlowBlockDto })
  @Post('flow-blocks')
  createFlowBlock(@Body() data: FlowBlockDto) {
    return this.chatbotService.createFlowBlock(data);
  }

  @ApiOperation({ summary: "Get a flow block by ID" })
  @Get('flow-block/:flowBlockId')
  getFlowBlockById(@Param('flowBlockId') flowBlockId: Types.ObjectId) {
    return this.chatbotService.getFlowBlockById(flowBlockId);
  }
  @ApiOperation({ summary: "Delete a flow block by ID" })
  @Delete('flow-blocks/:flowBlockId')
  deleteFlowBlock(@Param('flowBlockId') flowBlockId: Types.ObjectId) {
    return this.chatbotService.deleteFlowBlock(flowBlockId);
  }


  // flow button related endpoints can be added here

  @ApiOperation({ summary: "Create a new flow button" })
  @ApiBody({ type: FlowButtonDto })
  @Post('flow-buttons')
  createFlowButton(@Body() data: FlowButtonDto) {
   return this.chatbotService.createFlowButton(data);
  }

  @ApiOperation({ summary: "Update a flow button by ID" })
  @ApiBody({ type: FlowButtonDto })
  @Patch('flow-buttons/:flowButtonId')
  updateFlowButton(@Param('flowButtonId') flowButtonId: Types.ObjectId, @Body() data: Partial<FlowButtonDto>) {
    return this.chatbotService.updateFlowButton(flowButtonId, data);
  }

  @ApiOperation({ summary: "Get a flow button by ID" })
  @Get('flow-buttons/:flowButtonId')
  getFlowButtonById(@Param('flowButtonId') flowButtonId: Types.ObjectId) {
    return this.chatbotService.getFlowButtonById(flowButtonId);
  }

  @ApiOperation({ summary: "Delete a flow button by ID" })
  @Delete('flow-buttons/:flowButtonId')
  deleteFlowButton(@Param('flowButtonId') flowButtonId: Types.ObjectId) {
    return this.chatbotService.deleteFlowButton(flowButtonId);
  }
}
