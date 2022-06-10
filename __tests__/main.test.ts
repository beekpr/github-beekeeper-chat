import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'

test('can submit to stoplight', async () => {
  process.env['INPUT_TENANT'] =
    'stoplight.io/mocks/beekeeper/beekeeper-api/61115872'
  process.env['INPUT_APIKEY'] = 'foobar'
  process.env['INPUT_CHAT'] = '123'
  process.env['INPUT_MESSAGE'] = 'Testmessage'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})
