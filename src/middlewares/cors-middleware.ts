import cors from 'cors'

export default cors({
  credentials: true,
  origin: function (origin: string, callback) {
    const whitelist = (process.env.CORS_WHITELIST || '').split(',')
    if (whitelist.indexOf(origin) !== -1 || whitelist[0] == '*') callback(null, true)
    else callback(new Error(`Origin '${origin}' not allowed by CORS`))
  }
} as cors.CorsOptions)
