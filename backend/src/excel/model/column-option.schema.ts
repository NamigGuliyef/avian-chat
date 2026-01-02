
import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ColumnOption {

  @Prop()
  value?: string;

  @Prop({ required: true })
  label: string;

} 
