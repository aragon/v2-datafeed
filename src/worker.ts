import sleep from './helpers/sleep'
import Logger from './helpers/logger'

import OrganizationsSynchronizer from './models/OrganizationsSynchronizer'

Logger.setDefaults(false, true)
const logger = Logger.create('worker')

export async function sync() {
  while (true) {
    logger.info(`Checking for new organizations...`)
    await OrganizationsSynchronizer.sync()
    logger.info('Finished, will be back in 1 minute.')
    await sleep(60)
  }
}

sync().then(console.log).catch(console.error)
