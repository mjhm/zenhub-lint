/* eslint-disable camelcase */

// import core from '@actions/core'
// import github from '@actions/github'
import { getSwimlanes, getAllDependencies } from './zenhub.js'
import { getIssues, getIssueType } from './github.js'

const laneNames = ['Acceptance', 'Code Review', 'In Progress', 'To Do', 'Backlog', 'New Issues']

export const zenhubLint = async () => {
  const swimlanes = await getSwimlanes()
  const issues = await getIssues()
  const dependencies = await getAllDependencies()

  const report = ['Zenhub Lint Report\n']

  try {
    laneNames.forEach(laneName => {
      console.log('lanename', laneName)
      console.log(`swimlanes[${laneName}]`, swimlanes[laneName])
      const { issues: zenhubIssues } = swimlanes[laneName]
      zenhubIssues.forEach((zhIssue) => {
        const { issue_number, is_epic } = zhIssue
        const issue_key = String(issue_number)
        if (is_epic) return
        console.log('issue_key', issue_key)
        console.log('issues[issue_key]', issues[issue_key])
        console.log('all keys', Object.keys(issues))
        const currentIssue = issues[issue_number]
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
  } catch (e) {
    console.error(e.message)
  }

  console.log(JSON.stringify({
    issues,
    swimlanes,
    dependencies
  }, null, 2))

  return report
}
