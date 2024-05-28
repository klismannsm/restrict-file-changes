import * as core from '@actions/core'

export async function run(): Promise<void> {
  try {
    const regexPattern: string = core.getInput('regex', { required: true })
    const allowNewFiles: boolean = 'true' === core.getInput('allowNewFiles')
    const allowRemovedFiles: boolean = 'true' === core.getInput('allowRemovedFiles')

    core.debug(`regex: ${regexPattern}`)
    core.debug(`allowNewFiles: ${allowNewFiles}`)
    core.debug(`allowRemovedFiles: ${allowRemovedFiles}`)

    core.info(`Action still in WIP`)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}
