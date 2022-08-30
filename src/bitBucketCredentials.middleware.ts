import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { BitBucketCredentialsService } from './bitBucketCredentials.service';

@Injectable()
export class BitBucketCredentialsMiddleware implements NestMiddleware {
  constructor(
    private readonly credentialsService: BitBucketCredentialsService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const username = req.header('x-bitbucket-username');
    const password = req.header('x-bitbucket-password');

    if (username && password) {
      this.credentialsService.set({
        username,
        password,
      });
    }

    next();
  }
}
