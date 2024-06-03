import * as core from '@actions/core'
import { getOctokit } from '@actions/github'
import { IPullRequestInformation } from './github-info'

export type Status =
  | 'modified'
  | 'added'
  | 'removed'
  | 'renamed'
  | 'copied'
  | 'changed'
  | 'unchanged'

// Stripped down version of the github file, with just the information we need
export interface IChangedFile {
  filename: string
  status: Status
}

interface IGithubFile {
  sha: string
  filename: string
  status: Status
  additions: number
  deletions: number
  changes: number
  blob_url: string
  raw_url: string
  contents_url: string
  patch?: string | undefined
  previous_filename?: string | undefined
}

function buildFile(file: IGithubFile): IChangedFile {
  return {
    filename: file.filename,
    status: file.status,
  }
}

export async function getChangedFiles(
  githubToken: string,
  prInfo: IPullRequestInformation,
): Promise<IChangedFile[]> {
  const octokit = getOctokit(githubToken)
  const response = await octokit.paginate(octokit.rest.pulls.listFiles, {
    owner: prInfo.repositoryOwner,
    repo: prInfo.repositoryName,
    per_page: 100,
    pull_number: prInfo.number,
  })

  const files = response.map(file => buildFile(file))
  core.debug(`List of changed files: ${JSON.stringify(files)}`)

  return files
}
