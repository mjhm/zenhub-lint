/* eslint-disable camelcase */

// import core from '@actions/core'
// import github from '@actions/github'
import { getSwimlanes, getAllDependencies } from './zenhub.js'
import { getIssues, getIssueType } from './github.js'
import { keyBy } from 'lodash'

export const zenhubLint = async () => {
  const swimlanesArray = await getSwimlanes()
  console.log('swimlanesArray', swimlanesArray)
  const swimlanes = keyBy(swimlanesArray, 'name')
  console.log('swimlanes', swimlanes)
  const issuesResult = await getIssues()
  console.log('issuesResult', issuesResult)
  const issues = keyBy(issuesResult, 'number')

  const dependencies = await getAllDependencies()
  const keyBlockedByValue = {}
  const keyBlockingValue = {}
  console.log('h1')
  dependencies.forEach(([blocking, blocked]) => {
    if (!keyBlockedByValue[blocked]) {
      keyBlockedByValue[blocked] = []
    }
    keyBlockedByValue[blocked].push(blocking)

    if (!keyBlockingValue[blocking]) {
      keyBlockingValue[blocking] = []
    }
    keyBlockingValue[blocking].push(blocked)
  })

  console.log('ALL ' + JSON.stringify({
    issues,
    swimlanes,
    dependencies
  }, null, 2))

  const report = ['Zenhub Lint Report\n']

  console.log('h2c')
  const laneNames = ['Acceptance', 'Code Review', 'In Progress', 'To Do', 'Backlog', 'New Issues']
  laneNames.forEach(laneName => {
    console.log('lanename', laneName)
    console.log(`swimlanes[${laneName}]`, swimlanes[laneName])
    const { issues: zenhubIssues } = swimlanes[laneName]
    console.log('h3')
    zenhubIssues.forEach((zhIssue) => {
      const { issue_number, is_epic } = zhIssue
      const issue_key = String(issue_number)
      if (is_epic) return
      console.log('issue_key', issue_key)
      console.log('issues[issue_key]', issues[issue_key])
      console.log('all keys', Object.keys(issues))
      const currentIssue = issues[issue_number]
      if (currentIssue.pull_request) return // skipping PRs for now.
      const issueType = getIssueType(currentIssue)
      if (issueType === null) {
        return report.push(`issue ${issue_key} in ${laneName} doesn't have an issue type.`)
      }
      if (Array.isArray(issueType)) {
        return report.push(`issue ${issue_key} in ${laneName} has multiple issue types.`)
      }
      zhIssue.issueType = issueType
    })
  })

  return report
}
