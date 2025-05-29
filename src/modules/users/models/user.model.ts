import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface UserDocument extends User, Document {
  id: string;
}

@Schema()
export class User {
  @Prop({ required: false })
  name?: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({})
  password: string;

  @Prop()
  googleId?: string;

  @Prop()
  provider?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
