# Personal Automations

## Production

The production root URL is https://little-river-5796.fly.dev.

## Features

### bitbucket/pulls/opened

Provides a list of all your open PRs in BitBucket, along with creation days and reviewers.
Optimized for pasting inside a code-block within Slack.

*Credentials are not stored on the server, the server only passes them trough to BitBucket.*

```shell
curl --location --request GET 'https://little-river-5796.fly.dev/bitbucket/pulls/opened' \
--header 'x-bitbucket-username: BITBUCKET_USERNAME' \
--header 'x-bitbucket-password: BITBUCKET_PASSWORD'
```
