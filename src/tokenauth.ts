import {RequestHandler} from '@actions/http-client/lib/interfaces'
import {HttpClientResponse} from '@actions/http-client'
import * as http from 'http'

export class TokenAuthHandler implements RequestHandler {
  token: string

  constructor(token: string) {
    this.token = token
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canHandleAuthentication(response: HttpClientResponse): boolean {
    return false
  }

  async handleAuthentication(): Promise<HttpClientResponse> {
    throw new Error('not implemented')
  }

  prepareRequest(options: http.RequestOptions): void {
    if (!options.headers) {
      throw Error('The request has no headers')
    }
    options.headers['Authorization'] = `Token ${this.token}`
  }
}
