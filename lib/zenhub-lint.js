/* eslint-disable camelcase */

// import core from '@actions/core'
// import github from '@actions/github'
import { getSwimlanes, getAllDependencies } from './zenhub.js'
import { getIssues, getIssueType } from './github.js'

const laneNames = ['Acceptance', 'Code Review', 'In Progress', 'To Do', 'Backlog', 'New Issues']

const checkAll = (swimlanes, report) => {
  laneNames.forEach(laneName => {
    const { issues: zenhubIssues } = swimlanes[laneName]
    zenhubIssues.forEach((zhIssue) => {
      const { issueType, blockedBy, issue_number } = zhIssue
      if (issueType === 'story' && (blockedBy || []).length === 0) {
        return report.push(`story ${issue_number} in ${laneName} doesn't have any blocking tasks.`)
      }
    })
  })
}

export const zenhubLint = async () => {
  const swimlanes = await getSwimlanes()
  const issues = await getIssues()
  const dependencies = await getAllDependencies()

  const report = ['Zenhub Lint Report\n']

  try {
    laneNames.forEach(laneName => {
      const { issues: zenhubIssues } = swimlanes[laneName]
      zenhubIssues.forEach((zhIssue) => {
        const { issue_number, is_epic } = zhIssue
        if (is_epic) return
        const currentIssue = issues[issue_number]
        const issueType = getIssueType(currentIssue)
        if (issueType === null) {
          return report.push(`issue ${issue_number} in ${laneName} doesn't have an issue type.`)
        }
        if (Array.isArray(issueType)) {
          return report.push(`issue ${issue_number} in ${laneName} has multiple issue types.`)
        }
        zhIssue.issueType = issueType
        zhIssue.blockedBy = dependencies.keyBlockedByValue[issue_number]
        zhIssue.blocking = dependencies.keyBlockingValue[issue_number]
      })
    })
    checkAll(swimlanes, report)
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
