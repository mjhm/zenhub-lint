/* eslint-disable camelcase */

// import core from '@actions/core'
// import github from '@actions/github'
import { getSwimlanes, getAllDependencies } from './zenhub.js'
import { getIssues, getIssueType } from './github.js'
// import {  } from 'lodash'

const laneNames = ['Acceptance', 'QA', 'Code Review', 'In Progress', 'To Do', 'Backlog', 'New Issues']
const developers = ['andrevitalb', 'brunocerk', 'hallettj', 'JoelAtDeluxe', 'mjhm', 'ramirlm', 'snailin90', 'vinilana']

const checkAll = async (swimlanes, report) => {
  const issues = await getIssues()
  laneNames.forEach(laneName => {
    if (!swimlanes[laneName]) return
    // console.log('checkAll laneName', laneName)
    // console.log('checkAll swimlane', swimlanes[laneName])
    const { issues: zenhubIssues } = swimlanes[laneName]
    zenhubIssues.forEach((zhIssue) => {
      const { issueType, blockedBy, blocking, issue_number, estimate, assignees } = zhIssue

      if (issueType === 'story') {
        if (!['Acceptance', 'QA', 'In Progress', 'New Issues'].includes(laneName)) {
          return report.push(`story ${issue_number} can't be in the ${laneName} lane`)
        }
        if ((blockedBy || []).length === 0) {
          return report.push(`story ${issue_number} in ${laneName} doesn't have any blocking tasks.`)
        }
        const hasOpenTasks = blockedBy.some(taskNumber => {
          // console.log('taskNumber', taskNumber)
          // console.log('issues[taskNumber]', issues[taskNumber])
          // if (!issues[taskNumber]) {
          //   console.log('taskNumbers', Object.keys(issues).length, Object.keys(issues))
          // }
          return issues[taskNumber] && issues[taskNumber].state === 'open'
        })
        if (['Acceptance', 'QA'].includes(laneName)) {
          if (hasOpenTasks) {
            return report.push(`story ${issue_number} in ${laneName} has open blocking task(s).`)
          }
        } else {
          if (!hasOpenTasks) {
            return report.push(`story ${issue_number} in ${laneName} has no open blocking tasks.`)
          }
        }
        const hasActiveTasks = blockedBy.some(taskNumber => {
          return !issues[taskNumber] || ['Code Review', 'In Progress', 'To Do'].includes(issues[taskNumber].laneName)
        })
        if (laneName === 'New Issues' && hasActiveTasks) {
          return report.push(`story ${issue_number} in ${laneName} has active tasks and should be moved to In Progress.`)
        }
      }
      if (issueType === 'task') {
        if (['Acceptance', 'QA'].includes(laneName)) {
          return report.push(`task ${issue_number} can't be in the ${laneName} lane`)
        }
        if (!blocking || blocking.length === 0) {
          return report.push(`task ${issue_number} in ${laneName} isn't blocking anything.`)
        }
      }

      if (issueType === 'bug' || issueType === 'task' || issueType === 'story-task') {
        if (['Acceptance', 'QA', 'Code Review', 'In Progress', 'To Do', 'Backlog'].includes(laneName)) {
          if (!estimate) {
            return report.push(`${issueType} ${issue_number} in ${laneName} is not pointed.`)
          }
        }
        if (laneName === 'New Issues') {
          if (estimate) {
            return report.push(`${issueType} ${issue_number} in New Issues is pointed and should be moved to Backlog.`)
          }
        }
      }
      if (['Acceptance', 'QA', 'Code Review'].includes(laneName) && issueType !== 'pr') {
        if (!(assignees || []).some(assignee => developers.includes(assignee))) {
          return report.push(`${issueType} ${issue_number} in ${laneName} doesn't have an assigned developer`)
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
      if (!swimlanes[laneName]) {
        return report.push(`Swimlane ${laneName} doesn't exist.`)
      }
      const { issues: zenhubIssues } = swimlanes[laneName]
      zenhubIssues.forEach((zhIssue) => {
        const { issue_number, is_epic } = zhIssue
        if (is_epic) return
        const currentIssue = issues[issue_number]
        const issueType = getIssueType(currentIssue)
        if (issueType === null) {
          return report.push(`issue ${issue_number} in ${laneName} doesn't have an issue type.`)
        }
        if (!['bug', 'discussion', 'pr', 'story', 'story-task', 'task'].includes(issueType)) {
          return report.push(`issue ${issue_number} in ${laneName} has invalid issue type ${issueType}.`)
        }
        // Enhance issue representations
        currentIssue.laneName = laneName // So that we can easily check this for blocking issues.
        zhIssue.issueType = issueType
        zhIssue.blockedBy = dependencies.keyBlockedByValue[issue_number]
        zhIssue.blocking = dependencies.keyBlockingValue[issue_number]
        zhIssue.assignees = (currentIssue.assignees || []).map(assignee => assignee.login)
        console.log('zhIssue', zhIssue)
      })
    })
    await checkAll(swimlanes, report)
  } catch (e) {
    console.error('***ERROR***', e.message)
    console.error(e)
  }

  console.log(JSON.stringify({
    issues,
    swimlanes,
    dependencies
  }, null, 2))

  return report
}
