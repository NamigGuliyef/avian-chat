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
}
