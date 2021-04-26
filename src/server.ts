import dotenv from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser'

import errorHandler from './middlewares/error-handler'
import corsMiddleware from './middlewares/cors-middleware'
import asyncMiddleware from './middlewares/async-middleware'
import OrganizationController from './controllers/OrganizationController'

dotenv.config()

const app = express()
app.use(corsMiddleware)
app.use(bodyParser.json())

app.get('/', (req, res) => res.send('Hello!'))
app.get('/organizations', asyncMiddleware(OrganizationController.all))
app.get('/organizations/:address', asyncMiddleware(OrganizationController.show))

app.use(errorHandler)

const PORT = process.env.SERVER_PORT || 8000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
