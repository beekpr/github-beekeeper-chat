import * as core from '@actions/core'
import fs from 'fs'
import FormData from 'form-data'
import {HttpClient} from '@actions/http-client'
import {XMLParser} from 'fast-xml-parser'

export class BeekeeperFileUpload {
  tenant: string
  http: HttpClient
  token: string

  constructor(tenant: string, token: string, http: HttpClient) {
    this.tenant = tenant
    this.http = http
    this.token = token
  }

  async uploadFile(file: string): Promise<object> {
    const uploadTokenUrl = `https://${this.tenant}/api/2/files/attachment_file/upload/token`

    core.info(`Uploading file ${file}`)
    const contents = fs.createReadStream(file)

    core.info(`Requesting token`)
    const tokenResponse = await this.http.get(uploadTokenUrl)
    let rc = tokenResponse.message.statusCode as Number
    if (rc < 200 || rc > 299) {
      core.setFailed('Invalid response code for upload token request')
      return {}
    }
    const tokenObj = JSON.parse(await tokenResponse.readBody())

    // Lets build that form
    const form = new FormData()
    for (const entry of tokenObj['additional_form_data']) {
      form.append(entry.name, entry.value)
    }
    form.append(tokenObj['file_param_name'], contents)

    const neutral = new HttpClient()
    const uploadResult = await neutral.post(
      tokenObj['upload_url'],
      form.getBuffer().toString(),
      form.getHeaders()
    )
    rc = uploadResult.message.statusCode as Number
    if (rc < 200 || rc > 299) {
      core.setFailed('Invalid response code for upload')
      return {}
    }

    let keyVal = ''
    if (tokenObj['upload_response_data_type'] === 'xml') {
      const parser = new XMLParser()
      const obj = parser.parse(await uploadResult.readBody())
      keyVal = obj.key
    } else {
      const obj = JSON.parse(await uploadResult.readBody())
      keyVal = obj.key
    }

    // Now that we have the file uploaded, we need to register it

    const registerFileURL = `https://${this.tenant}/api/2/files/attachment_file/upload`
    const registerResult = await this.http.post(
      registerFileURL,
      JSON.stringify({
        media_type: 'text/plain',
        key: keyVal,
        size: form.getLengthSync()
      }),
      {
        'Content-Type': 'application/json'
      }
    )
    rc = registerResult.message.statusCode as Number
    if (rc < 200 || rc > 299) {
      core.setFailed('Invalid response code for register')
      return {}
    }
    const fileMetaObj = JSON.parse(await registerResult.readBody())
    core.info(`file upload succeeded, metadata: ${fileMetaObj}`)

    return {
      usage_type: 'attachment_file',
      id: fileMetaObj['id'],
      media_type: 'text/plain',
      size: form.getLengthSync(),
      url: fileMetaObj['url'],
      name: file
    }
  }
}
