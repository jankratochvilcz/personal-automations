import { Controller, Get, Render } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { formatDistance, parseISO } from 'date-fns';

import { BitBucketService } from './bitBucket.service';
import { range } from './utils/number';

type GetResponse = {
  pullRequests: {
    name: string;
    url: string;
    created: string;
  }[];
};

const getWithFixedLength = (name: string, length: number) => {
  if (name.length > length) {
    return `${name.substring(0, length - 2)}... `;
  }

  const whitespace = range(0, length - name.length).reduce(
    (previous) => `${previous} `,
    '',
  );

  return name + whitespace + ' ';
};

@Controller('bitbucket/pulls/opened')
@ApiHeader({ name: 'x-bitbucket-username' })
@ApiHeader({ name: 'x-bitbucket-password' })
export class BitBucketPullRequestsController {
  constructor(private readonly bitBucketService: BitBucketService) {}

  @Get()
  @Render('bitBucketPullRequests')
  async get(): Promise<GetResponse> {
    const pullRequests = await this.bitBucketService.getPRsForUser();

    const pullRequestsFormatted = pullRequests
      .sort(
        (a, b) =>
          parseISO(a.created_on).getTime() - parseISO(b.created_on).getTime(),
      )
      .map((x) => ({
        name: x.title,
        url: x.links.html.href,
        created: `from ${formatDistance(
          parseISO(x.created_on),
          new Date(),
        )} ago`,
        reviewers:
          x.reviewers.length > 0
            ? x.reviewers
                .map((x) => x.nickname.split(/[\.\s]/)[0])
                .map((x) => x[0].toUpperCase() + x.slice(1))
                .reduce((previous, current) => `${previous}, ${current}`)
            : '⚠️ no reviewers',
      }));

    const longestTitleLength = Math.max(
      ...pullRequestsFormatted.map((x) => x.name.length),
    );

    const longestCreatedLength = Math.max(
      ...pullRequestsFormatted.map((x) => x.created.length),
    );

    const longestReviewersLength = Math.max(
      ...pullRequestsFormatted.map((x) => x.reviewers.length),
    );

    const effectiveLongestTitleLength = Math.min(longestTitleLength, 50);

    const pullRequestsFormattedTabular = pullRequestsFormatted.map(
      ({ name, url, created, reviewers }) => ({
        name: getWithFixedLength(name, effectiveLongestTitleLength),
        url,
        created: getWithFixedLength(created, longestCreatedLength),
        reviewers: getWithFixedLength(reviewers, longestReviewersLength),
      }),
    );

    return {
      pullRequests: pullRequestsFormattedTabular,
    };
  }
}
