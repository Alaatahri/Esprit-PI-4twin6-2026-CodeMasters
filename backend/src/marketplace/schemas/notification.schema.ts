import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info',
  })
  type: string;

  @Prop({ type: Boolean, default: false })
  lu: boolean;

  @Prop({ type: String, required: false })
  lien?: string;

  @Prop({ type: Object, required: false })
  data?: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
