/* eslint-disable camelcase */

// import core from '@actions/core'
// import github from '@actions/github'
import { getSwimlanes, getAllDependencies } from './zenhub.js'
import { getIssues, getIssueType } from './github.js'

const laneNames = ['Acceptance', 'Code Review', 'In Progress', 'To Do', 'Backlog', 'New Issues']

const checkAll = async (swimlanes, report) => {
  const issues = await getIssues()
  laneNames.forEach(laneName => {
    console.log('checkAll laneName', laneName)
    console.log('checkAll swimlane', swimlanes[laneName])
    const { issues: zenhubIssues } = swimlanes[laneName]
    zenhubIssues.forEach((zhIssue) => {
      const { issueType, blockedBy, issue_number } = zhIssue
      if (issueType === 'story') {
        if (!['Acceptance', 'In Progress', 'New Issues'].includes(laneName)) {
          return report.push(`story ${issue_number} can't be in the ${laneName} lane`)
        }
        if ((blockedBy || []).length === 0) {
          return report.push(`story ${issue_number} in ${laneName} doesn't have any blocking tasks.`)
        }
        const hasOpenTasks = blockedBy.some(taskNumber => {
          console.log('taskNumber', taskNumber)
          console.log('issues[taskNumber]', issues[taskNumber])
          if (!issues[taskNumber]) {
            console.log('taskNumbers', Object.keys(issues).length, Object.keys(issues))
          }
          return issues[taskNumber].state === 'open'
        })
        if (laneName === 'Acceptance' && hasOpenTasks) {
          return report.push(`story ${issue_number} in ${laneName} has open blocking task(s).`)
        } else if (laneName !== 'Acceptance' && hasOpenTasks) {
          return report.push(`story ${issue_number} in ${laneName} has no blocking task.`)
        }
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
      console.log('zenhubLint laneName', laneName)
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
        console.log('zhIssue', zhIssue)
      })
    })
    await checkAll(swimlanes, report)
  } catch (e) {
    console.error(e.message)
    console.error(e)
  }

  console.log(JSON.stringify({
    issues,
    swimlanes,
    dependencies
  }, null, 2))

  return report
}
