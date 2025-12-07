import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: VercelResponse | Response, next: NextFunction) => {
  console.error('Global Error Handler:', err); // Log the error for debugging purposes

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response: any = {
    error: message,
    stack: err.stack, // Include stack trace for debugging
    details: err // Include full error object if possible
  };

  res.status(statusCode).json(response);
};

export default errorHandler;
