import { Request } from 'express';
import { Document } from 'mongoose';
import { Secret } from 'jsonwebtoken';

export interface UserDocument extends Document {
  name: string;
  username: string;
  email: string;
  role: 'administrator' | 'client' | 'employee';
  password: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  getSignedJwtToken(): string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}