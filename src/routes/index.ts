import { Router } from 'express'
import fs from 'fs' // filesystem
import path from 'path'

const router = Router()
const PATH_ROUTES = __dirname

const getModuleName = (filename: string): string => {
  const name = path.parse(filename).name
  return name
}

const getRouteName = (filename: string): string => {
  const routeName = filename.split('.')[0]
  return routeName
}

fs.readdirSync(PATH_ROUTES).filter(async (file) => {
  const moduleName = getModuleName(file)
  if (moduleName === null || moduleName === 'index') return
  const route = (await import(`./${moduleName}`)).default as Router
  router.use(`/${getRouteName(file)}`, route)
})

export default router
