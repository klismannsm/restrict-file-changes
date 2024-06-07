import * as core from '@actions/core'

import * as main from '../src/main'
import { IChangedFile, getChangedFiles } from '../src/changed-files'
import { evaluateFiles } from '../src/files-evaluator'
import { IPullRequestInformation, getPullRequestInfo } from '../src/github-info'

const runMock = jest.spyOn(main, 'run')

jest.mock('@actions/core')
jest.mock('../src/changed-files')
jest.mock('../src/files-evaluator')
jest.mock('../src/github-info')

describe('action', () => {
  const prInfo: IPullRequestInformation = {
    repositoryOwner: 'werewolf',
    repositoryName: 'full-moon',
    number: 666,
  }
  const changedFiles: IChangedFile[] = [
    { filename: 'removed-file.ts', status: 'removed', additions: 0, deletions: 10 },
    { filename: 'added-file.ts', status: 'added', additions: 10, deletions: 0 },
    { filename: 'modified-file.ts', status: 'modified', additions: 20, deletions: 10 },
    { filename: 'modified-file-additions.ts', status: 'modified', additions: 10, deletions: 0 },
    { filename: 'modified-file-deletions.ts', status: 'modified', additions: 0, deletions: 10 },
  ]

  const mockGetChangedFiles = jest.fn().mockResolvedValue(changedFiles)
  const mockGetPullRequestInfo = jest.fn().mockReturnValue(prInfo)
  const mockEvaluateFiles = jest.fn()
  const mockCoreDebug = jest.fn()
  const mockCoreSetFailed = jest.fn()

  beforeEach(() => {
    // The semicolon is needed to avoid these commands from chaining
    /* eslint-disable no-extra-semi */
    ;(getChangedFiles as jest.Mock).mockImplementation(mockGetChangedFiles)
    ;(getPullRequestInfo as jest.Mock).mockImplementation(mockGetPullRequestInfo)
    ;(evaluateFiles as jest.Mock).mockImplementation(mockEvaluateFiles)
    ;(core.debug as jest.Mock).mockImplementation(mockCoreDebug)
    ;(core.setFailed as jest.Mock).mockImplementation(mockCoreSetFailed)
    /* eslint-enable no-extra-semi */
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('evaluates the files', async () => {
    // eslint-disable-next-line no-extra-semi
    ;(core.getInput as jest.Mock).mockImplementation(name => {
      switch (name) {
        case 'githubToken':
          return 'token'
        case 'regex':
          return '.*tmp'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    expect(getChangedFiles).toHaveBeenCalledWith('token', prInfo)
    expect(evaluateFiles).toHaveBeenCalledWith('.*tmp', changedFiles, {
      allowAddedFiles: false,
      allowRemovedFiles: false,
      allowAdditions: false,
      allowDeletions: false,
    })
    expect(mockCoreDebug).toHaveBeenNthCalledWith(1, 'regex: .*tmp')
    expect(mockCoreSetFailed).not.toHaveBeenCalled()
  })

  it('fails if an exception is thrown', async () => {
    // eslint-disable-next-line no-extra-semi
    ;(core.getInput as jest.Mock).mockImplementation(name => {
      switch (name) {
        case 'githubToken':
          return 'token'
        case 'regex':
          throw new Error('regex is required')
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    expect(getChangedFiles).not.toHaveBeenCalled()
    expect(mockCoreSetFailed).toHaveBeenCalledWith('regex is required')
  })
})
