import * as core from '@actions/core'
import {TokenAuthHandler} from './tokenauth'
import {HttpClient} from '@actions/http-client'
import {BeekeeperFileUpload} from './fileupload'

async function run(): Promise<void> {
  try {
    const authHandler = new TokenAuthHandler(core.getInput('apikey'))
    const inputFile = core.getInput('files')

    const http = new HttpClient('github-beekeeper-chat', [authHandler])
    const fileupload = new BeekeeperFileUpload(
      core.getInput('tenant'),
      core.getInput('apikey'),
      http
    )

    let file = {}
    if (inputFile === '') {
      core.info('No files detected')
    } else {
      file = await fileupload.uploadFile(inputFile)
      if (file === {}) {
        return
      }
    }

    const chatUrl = `https://${core.getInput(
      'tenant'
    )}/api/2/chats/groups/${core.getInput('chat')}/messages`

    const message = {
      body: core.getInput('message'),
      attachment: file
    }

    core.debug('Sending message...')
    const result = await http.post(chatUrl, JSON.stringify(message), {
      'Content-Type': 'application/json'
    })
    core.debug('done')
    const rc = result.message.statusCode as Number
    if (rc < 200 || rc > 299) {
      core.setFailed('Invalid response code')
      const body = await result.readBody()
      core.warning(body)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
