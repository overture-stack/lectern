/*
 * Copyright (c) 2020 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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
