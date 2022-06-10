import * as core from '@actions/core'
import {TokenAuthHandler} from './tokenauth'
import {HttpClient} from '@actions/http-client'
import {BeekeeperFileUpload} from './fileupload'

async function run(): Promise<void> {
  try {
    const authHandler = new TokenAuthHandler(core.getInput('apikey'))
    const http = new HttpClient('github-beekeeper-chat', [authHandler])

    const inputFile = core.getInput('files')
    const fileupload = new BeekeeperFileUpload(
      core.getInput('tenant'),
      core.getInput('apikey'),
      http
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let apiFiles: any = {}
    if (inputFile === '') {
      core.info('No files detected')
    } else {
      const fileId = await fileupload.uploadFile(inputFile)
      if (fileId !== {}) {
        apiFiles = fileId
      } else {
        return
      }
    }

    const chatUrl = `https://${core.getInput(
      'tenant'
    )}/api/2/chats/groups/${core.getInput('chat')}/messages`
    core.debug('Sending message...')

    const message = {
      body: core.getInput('message'),
      attachment: apiFiles
    }

    const result = await http.post(chatUrl, JSON.stringify(message), {
      'Content-Type': 'application/json'
    })
    core.debug('done')
    const rc = result.message.statusCode as Number
    if (rc < 200 || rc > 299) {
      core.setFailed('Invalid response code')
    }

    const body = await result.readBody()
    core.info(body)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
