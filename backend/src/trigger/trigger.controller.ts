import { Controller, Get, Post, Body } from '@nestjs/common';
import { TriggerService } from './trigger.service';

@Controller('triggers')
export class TriggerController {
  constructor(private readonly triggerService: TriggerService) {}

  @Get()
  async findAll() {
    return this.triggerService.findAll();
  }

  @Post()
  async create(@Body() body: any) {
    return this.triggerService.create(body);
  }
}
