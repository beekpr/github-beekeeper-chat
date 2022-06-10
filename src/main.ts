import * as core from '@actions/core'
import {TokenAuthHandler} from './tokenauth'
import {HttpClient} from '@actions/http-client'

async function run(): Promise<void> {
  try {
    const authHandler = new TokenAuthHandler(core.getInput('apikey'))
    const http = new HttpClient('github-beekeeper-chat', [authHandler])

    const chatUrl = `https://${core.getInput(
      'tenant'
    )}/api/2/chats/groups/${core.getInput('chat')}/messages`
    core.debug('Sending message...')
    await http.post(
      chatUrl,
      JSON.stringify({
        body: core.getInput('message')
      })
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
