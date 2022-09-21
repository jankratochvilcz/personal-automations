import { Controller, Get, Param, Render } from '@nestjs/common';
import { ApiHeader, ApiOperation } from '@nestjs/swagger';
import { differenceInHours, formatDistance, parseISO } from 'date-fns';

import { BitBucketService } from './bitBucket.service';
import { range } from './utils/number';

type GetResponse = {
  pullRequests: {
    name: string;
    url: string;
    created: string;
  }[];
  anyStalePullRequests: boolean;
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

  @Get(':username')
  @Render('bitBucketPullRequests')
  @ApiOperation({
    description:
      'Provides a list of all your open PRs in BitBucket, along with creation days and reviewers. Optimized for pasting inside a code-block within Slack. Credentials are not stored on the server, the server only passes them trough to BitBucket.',
  })
  async get(@Param('username') username: string): Promise<GetResponse> {
    const pullRequests = await this.bitBucketService.getPRsForUser(username);

    const pullRequestsFormatted = pullRequests
      .sort(
        (a, b) =>
          parseISO(a.created_on).getTime() - parseISO(b.created_on).getTime(),
      )
      .map((x) => ({
        name: x.title,
        url: x.links.html.href,
        hoursSinceLastUpdate: differenceInHours(
          new Date(),
          parseISO(x.updated_on),
        ),
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

    const effectiveLongestTitleLength = Math.min(longestTitleLength, 60);

    const pullRequestsFormattedTabular = pullRequestsFormatted.map(
      ({ name, url, created, reviewers, hoursSinceLastUpdate }) => ({
        name: getWithFixedLength(name, effectiveLongestTitleLength),
        url,
        isStale: hoursSinceLastUpdate > 24,
        created: getWithFixedLength(created, longestCreatedLength),
        reviewers: getWithFixedLength(reviewers, longestReviewersLength),
      }),
    );

    return {
      pullRequests: pullRequestsFormattedTabular,
      anyStalePullRequests: pullRequestsFormattedTabular.some((x) => x.isStale),
    };
  }
}
