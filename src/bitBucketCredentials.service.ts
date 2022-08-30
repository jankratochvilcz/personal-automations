import { Injectable } from '@nestjs/common';
import { BitBucketCredentials } from './bitBucketCredentials';

@Injectable()
export class BitBucketCredentialsService {
  credentials: BitBucketCredentials | null;

  configure(credentials: BitBucketCredentials) {
    this.credentials = credentials;
  }

  get(): BitBucketCredentialsService['credentials'] {
    return this.credentials;
  }

  set(credentials: BitBucketCredentials) {
    this.credentials = credentials;
  }
}
