import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class RefreshToken {
  @Prop({ required: true })
  token!: string;

  @Prop({ required: true })
  userId!: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
