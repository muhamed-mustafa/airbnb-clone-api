import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, unique: true, trim: true })
  phone!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ type: Date })
  emailVerifiedAt?: Date | null;

  @Prop({ select: false })
  emailActivationCodeHash?: string;

  @Prop({ select: false })
  emailActivationExpiresAt?: Date;

  @Prop({ select: false, default: 0 })
  emailActivationAttempts?: number;

  @Prop({ select: false })
  emailActivationRequestedAt?: Date;

  @Prop({ select: false })
  passwordResetCodeHash?: string;

  @Prop({ select: false })
  passwordResetExpiresAt?: Date;

  @Prop({ select: false, default: 0 })
  passwordResetAttempts?: number;

  @Prop({ select: false })
  passwordResetRequestedAt?: Date;

  @Prop({ select: false })
  passwordResetTokenHash?: string;

  @Prop({ select: false })
  passwordResetTokenExpiresAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
