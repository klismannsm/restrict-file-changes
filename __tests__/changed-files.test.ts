import * as core from '@actions/core'
import { getOctokit } from '@actions/github'

import { IChangedFile, getChangedFiles } from '../src/changed-files'
import { IPullRequestInformation } from '../src/github-info'

jest.mock('@actions/core')
jest.mock('@actions/github')

describe('getChangedFiles', () => {
  const prInfo: IPullRequestInformation = {
    repositoryOwner: 'werewolf',
    repositoryName: 'full-moon',
    number: 666,
  }
  const changedFiles: IChangedFile[] = [
    { filename: 'modified-file.ts', status: 'modified' },
    { filename: 'removed-file.ts', status: 'removed' },
    { filename: 'added-file.ts', status: 'added' },
  ]

  const mockPaginate = jest.fn().mockResolvedValue(changedFiles)
  const mockListFiles = jest.fn().mockResolvedValue({ data: ['commit1', 'commit2'] })
  const mockCoreDebug = jest.fn()

  beforeEach(() => {
    // The semicolon is needed to avoid these commands from chaining
    /* eslint-disable no-extra-semi */
    ;(core.debug as jest.Mock).mockImplementation(mockCoreDebug)
    ;(getOctokit as jest.Mock).mockReturnValue({
      paginate: mockPaginate,
      rest: {
        pulls: {
          listFiles: mockListFiles,
        },
      },
    })
    /* eslint-enable no-extra-semi */
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return the full list of changed files', async () => {
    const files = await getChangedFiles('token', prInfo)
    expect(mockCoreDebug).toHaveBeenCalledWith(
      `List of changed files: ${JSON.stringify(changedFiles)}`,
    )
    expect(mockPaginate).toHaveBeenCalledWith(mockListFiles, {
      owner: prInfo.repositoryOwner,
      repo: prInfo.repositoryName,
      pull_number: prInfo.number,
      per_page: 100,
    })
    expect(files).toEqual(changedFiles)
  })
})
