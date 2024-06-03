import * as core from '@actions/core'

import { IChangedFile } from '../src/changed-files'
import { IEvaluatorFlags, evaluateFiles } from '../src/files-evaluator'

jest.mock('@actions/core')

describe('evaluateFiles', () => {
  const changedFiles: IChangedFile[] = [
    { filename: 'modified-file.ts', status: 'modified' },
    { filename: 'removed-file.ts', status: 'removed' },
    { filename: 'added-file.ts', status: 'added' },
  ]

  const mockCoreInfo = jest.fn()
  const mockCoreSetFailed = jest.fn()

  beforeEach(() => {
    // The semicolon is needed to avoid these commands from chaining
    /* eslint-disable no-extra-semi */
    ;(core.info as jest.Mock).mockImplementation(mockCoreInfo)
    ;(core.setFailed as jest.Mock).mockImplementation(mockCoreSetFailed)
    /* eslint-enable no-extra-semi */
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should fail if there are infringing files', () => {
    const regexPattern = '.*ts'
    const flags: IEvaluatorFlags = {
      allowNewFiles: false,
      allowRemovedFiles: false,
    }

    evaluateFiles(regexPattern, changedFiles, flags)
    expect(mockCoreInfo).toHaveBeenCalledWith(`Infringing files: ${JSON.stringify(changedFiles)}`)
    expect(mockCoreSetFailed).toHaveBeenCalledWith('There are files infringing the rule')
  })

  it('should not fail if there are no infringing files', () => {
    const regexPattern = '.*txt'
    const flags: IEvaluatorFlags = {
      allowNewFiles: false,
      allowRemovedFiles: false,
    }

    evaluateFiles(regexPattern, changedFiles, flags)
    expect(mockCoreInfo).toHaveBeenCalledWith('No files are infringing the rule')
    expect(mockCoreSetFailed).not.toHaveBeenCalled()
  })

  describe('when the infringing file was added', () => {
    it('should fail if the allowNewFiles flag is OFF', () => {
      const regexPattern = 'added-file.ts'
      const flags: IEvaluatorFlags = {
        allowNewFiles: false,
        allowRemovedFiles: false,
      }

      evaluateFiles(regexPattern, changedFiles, flags)
      expect(mockCoreInfo).toHaveBeenCalledWith(
        `Infringing files: ${JSON.stringify(changedFiles.splice(2, 1))}`,
      )
      expect(mockCoreSetFailed).toHaveBeenCalledWith('There are files infringing the rule')
    })

    it('should not fail if the allowNewFiles flag is ON', () => {
      const regexPattern = 'added-file.ts'
      const flags: IEvaluatorFlags = {
        allowNewFiles: true,
        allowRemovedFiles: false,
      }

      evaluateFiles(regexPattern, changedFiles, flags)
      expect(mockCoreInfo).toHaveBeenCalledWith('No files are infringing the rule')
      expect(mockCoreSetFailed).not.toHaveBeenCalled()
    })
  })

  describe('when the infringing file was removed', () => {
    it('should fail if the allowRemovedFiles flag is OFF', () => {
      const regexPattern = 'removed-file.ts'
      const flags: IEvaluatorFlags = {
        allowNewFiles: false,
        allowRemovedFiles: false,
      }

      evaluateFiles(regexPattern, changedFiles, flags)
      expect(mockCoreInfo).toHaveBeenCalledWith(
        `Infringing files: ${JSON.stringify(changedFiles.splice(1, 1))}`,
      )
      expect(mockCoreSetFailed).toHaveBeenCalledWith('There are files infringing the rule')
    })

    it('should not fail if the allowRemovedFiles flag is ON', () => {
      const regexPattern = 'added-file.ts'
      const flags: IEvaluatorFlags = {
        allowNewFiles: false,
        allowRemovedFiles: true,
      }

      evaluateFiles(regexPattern, changedFiles, flags)
      expect(mockCoreInfo).toHaveBeenCalledWith('No files are infringing the rule')
      expect(mockCoreSetFailed).not.toHaveBeenCalled()
    })
  })
})
