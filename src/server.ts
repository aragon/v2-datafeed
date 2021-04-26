import dotenv from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser'

import errorHandler from './middlewares/error-handler'
import corsMiddleware from './middlewares/cors-middleware'

dotenv.config()

const app = express()
app.use(corsMiddleware)
app.use(bodyParser.json())

app.get('/', (req, res) => res.send('Hello!'))

app.use(errorHandler)

const PORT = process.env.SERVER_PORT || 8000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
