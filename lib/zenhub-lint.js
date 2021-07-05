
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
  const issuesResult = await getIssues())
  console.log('issuesResult', issuesResult)
  const issues = keyBy(issuesResult.data.items, "number")

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

  console.log('ALL ' + JSON.stringify({
    issues,
    swimlanes,
    dependencies
  }, null, 2))
  

  const report = [ "Zenhub Lint Report\n" ]

  console.log('h2c')
  const laneNames = [ "Acceptance", "Code Review", "In Progress", "To Do", "Backlog", "New Issues" ]
  laneNames.forEach(laneName => {
    console.log('lanename', laneName)
    console.log(`swimlanes[${laneName}]`, swimlanes[laneName])
    const { issues } = swimlanes[laneName]
    console.log('h3')
    issues.forEach((issue) => {
      const { issue_number, is_epic } = issue
      const issue_key = String(issue_number)
      if (is_epic) return
      console.log('issue_key', issue_key)
      console.log('issues[issue_key]', issues[issue_key])
      const issueType = getIssueType(issues[String(issue_key)])
      if (issueType === null) {
        return report.push(`issue ${issue_key} in ${laneName} doesn't have an issue type.`)
      }
      if (Array.isArray(issueType)) {
        return report.push(`issue ${issue_key} in ${laneName} has multiple issue types.`)
      }
      issue.issueType = issueType
    })
  })

  return report
}