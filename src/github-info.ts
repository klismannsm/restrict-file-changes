import { context } from '@actions/github'

export interface IPullRequestInformation {
  repositoryOwner: string
  repositoryName: string
  number: number
}

export function getPullRequestInfo(): IPullRequestInformation {
  const { owner, repo } = context.repo
  const { pull_request } = context.payload
  if (!pull_request?.number) {
    throw new Error('Invalid pull request number')
  }

  return {
    repositoryOwner: owner,
    repositoryName: repo,
    number: pull_request.number,
  }
}
