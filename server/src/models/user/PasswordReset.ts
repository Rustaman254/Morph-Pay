import { Schema, model, Document } from 'mongoose';

export interface IPasswordReset extends Document {
  contact: string;                     
  tokenHash: string;                   
  expires: Date;                       
  used: boolean;                      
  createdAt: Date;                     
  updatedAt: Date;                     
}

const passwordResetSchema = new Schema<IPasswordReset>({
  contact: { type: String, required: true, index: true },
  tokenHash: { type: String, required: true },
  expires: { type: Date, required: true, index: true },
  used: { type: Boolean, default: false, index: true }
}, {
  timestamps: true
});

export const PasswordReset = model<IPasswordReset>('PasswordReset', passwordResetSchema);
