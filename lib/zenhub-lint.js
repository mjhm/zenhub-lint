
import { getSwimlanes, getAllDependencies } from './zenhub.js'

export const zenhubLint = async () => {
  const swimlanes = await getSwimlanes()
  const dependencies = await  getAllDependencies()
  console.log(JSON.stringify({
    swimlanes,
    dependencies
  }, null, 2))
  return "Zenhub Lint Report"
}