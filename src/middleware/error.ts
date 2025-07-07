import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

interface CustomError extends Error {
  status?: number;
  code?: number;
  errors?: Record<string, { message: string }>;
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error: CustomError = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.log(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, status: 404 } as CustomError;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, status: 400 } as CustomError;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message: message.join(', '), status: 400 } as CustomError;
  }

  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

export default errorHandler;