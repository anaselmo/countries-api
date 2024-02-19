import express from 'express'
import router from './routes'
import { errorMiddleware } from './middleware/errors.middleware'

const app = express()

app.use(express.json())

app.use('/api', router)

app.use(errorMiddleware)

// TODO: Move port to env
const port = 3000
app.listen(port)
console.log(`Listening on http://localhost:${port}`)

export default app
