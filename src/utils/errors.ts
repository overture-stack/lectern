import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Conflict';
  }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequest';
  }
}

export class MalformedVersionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MalformedVersion';
  }
}

export class InternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InternalServer';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFound';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Unauthorized';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Forbidden';
  }
}

export class InvalidReferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidReference';
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): any => {
  if (res.headersSent) {
    return next(err);
  }

  switch (err.name) {
    case 'Unauthorized':
      res.status(401);
      break;
    case 'Forbidden':
      res.status(403);
      break;
    case 'NotFound':
      res.status(404);
      break;
    case 'Conflict':
      res.status(409);
      break;
    case 'BadRequest':
      res.status(400);
      break;
    case 'MalformedVersion':
      res.status(400);
      break;
    case 'CastError':
      res.status(400);
      break;
    case 'InvalidReference':
      res.status(400);
      break;
    default:
      logger.error(`Internal Server Error\n${err.name}\n${err.message}\n${err.stack}`);
      res.status(500);
      break;
  }
  res.send({ error: err.name, message: err.message });
};
