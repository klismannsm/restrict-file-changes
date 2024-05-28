import * as core from '@actions/core'
import * as main from '../src/main'

const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let debugMock: jest.SpiedFunction<typeof core.debug>
let infoMock: jest.SpiedFunction<typeof core.info>
let errorMock: jest.SpiedFunction<typeof core.error>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    infoMock = jest.spyOn(core, 'info').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
  })

  it('logs the information', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'regex':
          return '.*tmp'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    expect(debugMock).toHaveBeenNthCalledWith(1, 'regex: .*tmp')
    expect(debugMock).toHaveBeenNthCalledWith(2, 'allowNewFiles: false')
    expect(debugMock).toHaveBeenNthCalledWith(3, 'allowRemovedFiles: false')
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Action still in WIP')
    expect(errorMock).not.toHaveBeenCalled()
  })

  it('sets a failed status', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'regex':
          throw new Error('regex is required')
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'regex is required')
    expect(errorMock).not.toHaveBeenCalled()
  })
})
