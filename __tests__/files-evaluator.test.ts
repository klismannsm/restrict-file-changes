import * as core from '@actions/core'

import { IChangedFile } from '../src/changed-files'
import { IEvaluatorFlags, evaluateFiles } from '../src/files-evaluator'

jest.mock('@actions/core')

describe('evaluateFiles', () => {
  const changedFiles: IChangedFile[] = [
    { filename: 'removed-file.ts', status: 'removed', additions: 0, deletions: 10 },
    { filename: 'added-file.ts', status: 'added', additions: 10, deletions: 0 },
    { filename: 'modified-file.ts', status: 'modified', additions: 20, deletions: 10 },
    { filename: 'modified-file-additions.ts', status: 'modified', additions: 10, deletions: 0 },
    { filename: 'modified-file-deletions.ts', status: 'modified', additions: 0, deletions: 10 },
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
      allowAddedFiles: false,
      allowRemovedFiles: false,
      allowAdditions: false,
      allowDeletions: false,
    }

    evaluateFiles(regexPattern, changedFiles, flags)
    expect(mockCoreInfo).toHaveBeenCalledWith(`Infringing files: ${JSON.stringify(changedFiles)}`)
    expect(mockCoreSetFailed).toHaveBeenCalledWith('There are files infringing the rule')
  })

  it('should not fail if there are no infringing files', () => {
    const regexPattern = '.*txt'
    const flags: IEvaluatorFlags = {
      allowAddedFiles: false,
      allowRemovedFiles: false,
      allowAdditions: false,
      allowDeletions: false,
    }

    evaluateFiles(regexPattern, changedFiles, flags)
    expect(mockCoreInfo).toHaveBeenCalledWith('No files are infringing the rule')
    expect(mockCoreSetFailed).not.toHaveBeenCalled()
  })

  describe('when the infringing file was added', () => {
    it('should fail if the allowAddedFiles flag is OFF', () => {
      const regexPattern = 'added-file.ts'
      const flags: IEvaluatorFlags = {
        allowAddedFiles: false,
        allowRemovedFiles: false,
        allowAdditions: false,
        allowDeletions: false,
      }
      const expectedChangedFiles = [changedFiles[1]]

      evaluateFiles(regexPattern, changedFiles, flags)
      expect(mockCoreInfo).toHaveBeenCalledWith(
        `Infringing files: ${JSON.stringify(expectedChangedFiles)}`,
      )
      expect(mockCoreSetFailed).toHaveBeenCalledWith('There are files infringing the rule')
    })

    it('should not fail if the allowAddedFiles flag is ON', () => {
      const regexPattern = 'added-file.ts'
      const flags: IEvaluatorFlags = {
        allowAddedFiles: true,
        allowRemovedFiles: false,
        allowAdditions: false,
        allowDeletions: false,
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
        allowAddedFiles: false,
        allowRemovedFiles: false,
        allowAdditions: false,
        allowDeletions: false,
      }
      const expectedChangedFiles = [changedFiles[0]]

      evaluateFiles(regexPattern, changedFiles, flags)
      expect(mockCoreInfo).toHaveBeenCalledWith(
        `Infringing files: ${JSON.stringify(expectedChangedFiles)}`,
      )
      expect(mockCoreSetFailed).toHaveBeenCalledWith('There are files infringing the rule')
    })

    it('should not fail if the allowRemovedFiles flag is ON', () => {
      const regexPattern = 'removed-file.ts'
      const flags: IEvaluatorFlags = {
        allowAddedFiles: false,
        allowRemovedFiles: true,
        allowAdditions: false,
        allowDeletions: false,
      }

      evaluateFiles(regexPattern, changedFiles, flags)
      expect(mockCoreInfo).toHaveBeenCalledWith('No files are infringing the rule')
      expect(mockCoreSetFailed).not.toHaveBeenCalled()
    })
  })

  describe('when the infringing file had content added', () => {
    it('should return all infringing files if the allowAdditions flag is OFF', () => {
      const regexPattern = 'modified-file.*.ts'
      const flags: IEvaluatorFlags = {
        allowAddedFiles: false,
        allowRemovedFiles: false,
        allowAdditions: false,
        allowDeletions: false,
      }
      const expectedChangedFiles = [changedFiles[2], changedFiles[3], changedFiles[4]]

      evaluateFiles(regexPattern, changedFiles, flags)
      expect(mockCoreInfo).toHaveBeenCalledWith(
        `Infringing files: ${JSON.stringify(expectedChangedFiles)}`,
      )
      expect(mockCoreSetFailed).toHaveBeenCalledWith('There are files infringing the rule')
    })

    it('should skip a file with only additions if the allowAdditions flag is ON', () => {
      const regexPattern = 'modified-file.*.ts'
      const flags: IEvaluatorFlags = {
        allowAddedFiles: false,
        allowRemovedFiles: false,
        allowAdditions: true,
        allowDeletions: false,
      }
      const expectedChangedFiles = [changedFiles[2], changedFiles[4]]

      evaluateFiles(regexPattern, changedFiles, flags)
      expect(mockCoreInfo).toHaveBeenCalledWith(
        `Infringing files: ${JSON.stringify(expectedChangedFiles)}`,
      )
      expect(mockCoreSetFailed).toHaveBeenCalledWith('There are files infringing the rule')
    })
  })

  describe('when the infringing file had content removed', () => {
    it('should return all infringing files if the allowDeletions flag is OFF', () => {
      const regexPattern = 'modified-file.*.ts'
      const flags: IEvaluatorFlags = {
        allowAddedFiles: false,
        allowRemovedFiles: false,
        allowAdditions: false,
        allowDeletions: false,
      }
      const expectedChangedFiles = [changedFiles[2], changedFiles[3], changedFiles[4]]

      evaluateFiles(regexPattern, changedFiles, flags)
      expect(mockCoreInfo).toHaveBeenCalledWith(
        `Infringing files: ${JSON.stringify(expectedChangedFiles)}`,
      )
      expect(mockCoreSetFailed).toHaveBeenCalledWith('There are files infringing the rule')
    })

    it('should skip a file with only deletions if the allowDeletions flag is ON', () => {
      const regexPattern = 'modified-file.*.ts'
      const flags: IEvaluatorFlags = {
        allowAddedFiles: false,
        allowRemovedFiles: false,
        allowAdditions: false,
        allowDeletions: true,
      }
      const expectedChangedFiles = [changedFiles[2], changedFiles[3]]

      evaluateFiles(regexPattern, changedFiles, flags)
      expect(mockCoreInfo).toHaveBeenCalledWith(
        `Infringing files: ${JSON.stringify(expectedChangedFiles)}`,
      )
      expect(mockCoreSetFailed).toHaveBeenCalledWith('There are files infringing the rule')
    })
  })
})
