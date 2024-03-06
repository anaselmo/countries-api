import cors from 'cors'
import express from 'express'
import router from './routes'
import { errorMiddleware } from './middleware/errors.middleware'
import dotenv from 'dotenv'
dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())
app.use(errorMiddleware)
app.use('/api', router)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`)
})

export default app
