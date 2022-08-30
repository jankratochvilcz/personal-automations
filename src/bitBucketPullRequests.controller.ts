import { Controller, Get, Render } from '@nestjs/common';
import { formatDistance, parseISO } from 'date-fns';
import { BitBucketService } from './bitBucket.service';

type GetResponse = {
  pullRequests: {
    name: string;
    url: string;
    created: string;
  }[];
};

@Controller('bitbucket/pulls/opened')
export class BitBucketPullRequestsController {
  constructor(private readonly bitBucketService: BitBucketService) {}

  @Get()
  @Render('bitBucketPullRequests')
  async get(): Promise<GetResponse> {
    const pullRequests = await this.bitBucketService.getPRsForUser();

    const pullRequestsFormatted = pullRequests.map((x) => ({
      name: x.title,
      url: x.links.html.href,
      created: formatDistance(parseISO(x.created_on), new Date()),
      reviewers:
        x.reviewers.length > 0
          ? x.reviewers
              .map((x) => x.nickname)
              .reduce((previous, current) => `${previous}, ${current}`)
          : '⚠️ no reviewers',
    }));

    return {
      pullRequests: pullRequestsFormatted,
    };
  }
}
