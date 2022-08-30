export type BitBuckerUser = {
  username: string;
};

export type BitBucketPullRequest = BitBucketPullRequestInList & {
  reviewers: {
    nickname: string;
    account_id: string;
  }[];
};

export type BitBucketPullRequestInList = {
  id: string;
  type: string;
  created_on: string;
  updated_on: string;
  state: 'OPEN';
  title: string;
  links: {
    html: {
      href: string;
    };
  };
  destination: {
    repository: {
      full_name: string;
      uuid: string;
    };
  };
};
