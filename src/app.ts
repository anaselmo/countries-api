import cors from 'cors'
import express from 'express'
import router from './routes'
import { errorMiddleware } from './middleware/errors.middleware'
import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT

const app = express()
app.use(express.json())
app.use(cors())
app.use('/api', router)
app.use(errorMiddleware)

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`)
})

export default app
