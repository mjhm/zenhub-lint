
import { getSwimlanes, getAllDependencies } from './lib/zenhub.js'

export const zenhubLint = async () => {
  const swimlanes = await getSwimlanes()
  const dependencies = await  getAllDependencies()
  console.log('swimlanes', swimlanes)
  console.log('dependencies', dependencies)
  return "Zenhub Lint Report"
}