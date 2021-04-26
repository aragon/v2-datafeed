import chalk from 'chalk'

const DEFAULTS = {
  verbose: false,
  silent: true
}

export default class Logger {
  actor: string
  color: string

  static setDefaults(silent: boolean, verbose: boolean) {
    DEFAULTS.silent = silent
    DEFAULTS.verbose = verbose
    return Logger
  }

  static create(actor: string, color = 'white') {
    return new Logger(actor, color)
  }

  constructor(actor: string, color = 'white') {
    this.actor = actor
    this.color = color
  }

  info(msg: string | object) {
    if (!DEFAULTS.verbose) return
    this.log(msg, '️  ', 'white')
  }

  success(msg: string | object) {
    this.log(msg, '✅', 'green')
  }

  warn(msg: string | object, error?: Error) {
    if (error) console.log(error)
    this.log(msg, '⚠️ ', 'yellow')
  }

  error(msg: string | object, error?: Error) {
    this.log(msg, '🚨', 'red')
    if (error) console.log(error)
  }

  log(msg: string | object, emoji: string, color = 'white') {
    if (DEFAULTS.silent) return
    let formattedMessage = chalk.keyword(color)(`${emoji}  ${this._stringify(msg)}`)
    if (DEFAULTS.verbose) {
      const formatedPrefix = chalk.keyword(this.color)(`[${this.actor}]`)
      formattedMessage = `${formatedPrefix} ${formattedMessage}`
    }
    console.error(formattedMessage)
  }

  _stringify(obj: any) {
    return (typeof obj === 'object') ? JSON.stringify(obj, null, 2) : obj.toString()
  }
}
