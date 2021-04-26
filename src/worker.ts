import sleep from './helpers/sleep'
import Logger from './helpers/logger'

import OrganizationsFetcher from './lib/OrganizationsFetcher'
import MigratedValueCalculator from './lib/MigratedValueCalculator'

Logger.setDefaults(false, true)
const logger = Logger.create('worker')

export async function fetcher() {
  while (true) {
    logger.info(`Checking for new organizations...`)
    await OrganizationsFetcher.call()
    logger.info('Finished, will be back in 1 minute.')
    await sleep(60)
  }
}

export async function calculator() {
  while (true) {
    logger.info(`Calculating migrated value for pending organizations...`)
    await MigratedValueCalculator.call()
    logger.info('Finished, will be back in 1 minute.')
    await sleep(60)
  }
}
