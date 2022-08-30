import { MiddlewareConsumer, Module } from '@nestjs/common';
import { BitBucketPullRequestsController } from './bitBucketPullRequests.controller';
import { BitBucketService } from './bitBucket.service';
import { BitBucketCredentialsService } from './bitBucketCredentials.service';
import { BitBucketCredentialsMiddleware } from './bitBucketCredentials.middleware';

@Module({
  imports: [],
  controllers: [BitBucketPullRequestsController],
  providers: [BitBucketService, BitBucketCredentialsService],
})
export class BitBucketModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BitBucketCredentialsMiddleware)
      .forRoutes(BitBucketPullRequestsController);
  }
}
