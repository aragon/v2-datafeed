export default class HttpError extends Error {
  code!: number
  content!: any

  static NOT_FOUND(content: any) {
    return new this(404, content)
  }

  constructor(code: number, content: any) {
    super(`HTTP error ${code}`)
    this.name = 'HttpError'
    this.code = code
    this.content = content
  }
}
