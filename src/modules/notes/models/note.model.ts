import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { StatusEnum } from '../entities/note.entity';

export interface NoteDocument extends Note, Document {
  id: string;
}

@Schema()
export class Note {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, enum: StatusEnum })
  status: StatusEnum;

  @Prop({ required: false })
  tags: string[];

  @Prop({ required: true })
  userId: string;

  @Prop({ required: false, type: Date })
  archivedAt: Date | undefined;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
