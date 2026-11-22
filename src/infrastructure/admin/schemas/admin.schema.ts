import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ default: false })
  isSuperAdmin!: boolean;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop()
  deletedAt!: Date;

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

export const AdminSchema = SchemaFactory.createForClass(Admin);
