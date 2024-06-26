import * as core from '@actions/core'
import { IChangedFile } from './changed-files'

export interface IEvaluatorFlags {
  allowAddedFiles: boolean
  allowRemovedFiles: boolean
  allowAdditions: boolean
  allowDeletions: boolean
}

function isFileInfringingTheRule(
  regExp: RegExp,
  flags: IEvaluatorFlags,
  file: IChangedFile,
): boolean {
  const filenameMatches = regExp.test(file.filename)
  if (!filenameMatches) {
    return false
  }

  if (flags.allowAddedFiles && file.status === 'added') {
    return false
  }

  if (flags.allowRemovedFiles && file.status === 'removed') {
    return false
  }

  if (flags.allowAdditions && file.additions > 0 && file.deletions === 0) {
    return false
  }

  if (flags.allowDeletions && file.deletions > 0 && file.additions === 0) {
    return false
  }

  return true
}

export function evaluateFiles(
  regexPattern: string,
  files: IChangedFile[],
  flags: IEvaluatorFlags,
): void {
  const regExp = new RegExp(regexPattern)
  const filesThatAreInfringingTheRule: IChangedFile[] = []
  for (const file of files) {
    if (isFileInfringingTheRule(regExp, flags, file)) {
      filesThatAreInfringingTheRule.push(file)
    }
  }

  if (filesThatAreInfringingTheRule.length === 0) {
    core.info('No files are infringing the rule')

    return
  }

  core.info(`Infringing files: ${JSON.stringify(filesThatAreInfringingTheRule)}`)
  core.setFailed('There are files infringing the rule')
}
