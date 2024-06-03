import * as core from '@actions/core'
import { getChangedFiles } from './changed-files'
import { IEvaluatorFlags, evaluateFiles } from './files-evaluator'
import { getPullRequestInfo } from './github-info'

function getEvaluatorFlags(): IEvaluatorFlags {
  return {
    allowNewFiles: 'true' === core.getInput('allowNewFiles'),
    allowRemovedFiles: 'true' === core.getInput('allowRemovedFiles'),
  }
}

export async function run(): Promise<void> {
  try {
    const regexPattern: string = core.getInput('regex', { required: true })
    const githubToken: string = core.getInput('githubToken', { required: true })
    const prInfo = getPullRequestInfo()
    const evaluatorFlags = getEvaluatorFlags()

    core.debug(`regex: ${regexPattern}`)
    const changedFiles = await getChangedFiles(githubToken, prInfo)

    evaluateFiles(regexPattern, changedFiles, evaluatorFlags)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('Unknown error occurred')
    }
  }
}
