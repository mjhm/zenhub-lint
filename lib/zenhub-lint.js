
import core from '@actions/core'
import github from '@actions/github'
import https from 'https'
import { getSwimlanes, getAllDependencies } from './zenhub.js'
import { getIssues, getIssueType } from './github.js'
import {keyBy} from "lodash"

export const zenhubLint = async () => {

  const swimlanesArray = await getSwimlanes()
  console.log('swimlanesArray', swimlanesArray)
  const swimlanes = keyBy(swimlanesArray, 'name')
  console.log('swimlanes', swimlanes)
  const issues = keyBy((await getIssues()).data.items, "number")
  const dependencies = await getAllDependencies()
  const keyBlockedByValue = {}
  const keyBlockingValue = {}
  console.log('h1')
  dependencies.forEach(([blocking, blocked])  => {
    if (! keyBlockedByValue[blocked]) {
      keyBlockedByValue[blocked] = []
    }
    keyBlockedByValue[blocked].push(blocking)

    if (! keyBlockingValue[blocking]) {
      keyBlockingValue[blocking] = []
    }
    keyBlockingValue[blocking].push(blocked)   
  })

  const report = [ "Zenhub Lint Report\n" ]

  console.log('h2')
  [ "Acceptance", "Code Review", "In Progress", "To Do", "Backlog", "New Issues" ].forEach(laneName => {
    const { issues } = swimlanes[laneName]
    console.log('h3')
    issues.forEach((issue) => {
      const { issue_number, is_epic } = issue
      if (is_epic) return
      const issueType = getIssueType(issues[issue_number])
      if (issueType === null) {
        return report.push(`issue ${issue_number} in ${laneName} doesn't have an issue type.`)
      }
      if (Array.isArray(issueType)) {
        return report.push(`issue ${issue_number} in ${laneName} has multiple issue types.`)
      }
      issue.issueType = issueType
    })
  })

  console.log('ALL ' + JSON.stringify({
    issues,
    swimlanes,
    dependencies
  }, null, 2))
  return report
}