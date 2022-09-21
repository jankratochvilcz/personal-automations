import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { BitBucketCredentialsService } from './bitBucketCredentials.service';
import {
  BitBuckerUser,
  BitBucketPullRequest,
  BitBucketPullRequestInList,
} from './bitBucketPullRequest';

const baseUrl = 'https://api.bitbucket.org/2.0/';

type PullRequestsForUserResponse = {
  values: BitBucketPullRequestInList[];
};

@Injectable()
export class BitBucketService {
  constructor(
    private readonly credentialsService: BitBucketCredentialsService,
  ) {}

  async getUser(): Promise<BitBuckerUser> {
    const credentials = this.credentialsService.get();

    const response = await axios.get<BitBuckerUser>(
      `${baseUrl}users/${credentials.username}`,
      {
        auth: credentials,
      },
    );

    return response.data;
  }

  async getPR(
    organization: string,
    repo: string,
    prId: string,
  ): Promise<BitBucketPullRequest> {
    const credentials = this.credentialsService.get();

    const response = await axios.get<BitBucketPullRequest>(
      `${baseUrl}repositories/${organization}/${repo}/pullrequests/${prId}`,
      {
        auth: credentials,
      },
    );

    return response.data;
  }

  async getPRsForUser(username: string): Promise<BitBucketPullRequest[]> {
    const credentials = this.credentialsService.get();

    const response = await axios.get<PullRequestsForUserResponse>(
      `${baseUrl}pullrequests/${username}`,
      {
        auth: credentials,
      },
    );

    const fullPrRequests = response.data.values.map(async (x) => {
      const repositoryParts = x.destination.repository.full_name.split('/');
      const organization = repositoryParts[0];
      const repository = repositoryParts[1];

      return await this.getPR(organization, repository, x.id);
    });

    const fullPrs = await Promise.all(fullPrRequests);

    return fullPrs;
  }
}
