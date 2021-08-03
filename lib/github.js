
import { keyBy } from 'lodash'
const github = require('@actions/github')

let issues = null

export const getIssues = async () => {
  if (issues) return issues
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
  let issuesArray = []
  let page = 1
  const q = 'repo:Originate/perfected+is:open'
  while (true) {
    const result = await octokit.rest.search.issuesAndPullRequests({ q, per_page: 100, page })
    issuesArray = [...issuesArray, ...result.data.items]
    page += 1
    if ((((result || {}).data || {}).items || []).length === 0) break
    if (page > 100) {
      throw new Error('More than 100 pages of issues.')
    }
  }
  // console.log('total issue count', issuesArray.length)
  // console.log('all Issues', JSON.stringify(issuesArray.map(i => [i.number, i.state]), null, 2))
  issues = keyBy(issuesArray, 'number')
  return issues
}

export const getIssueType = issue => {
  const types = []
  if (issue.pull_request) {
    types.push('pr')
  }
  (issue.labels || []).forEach(label => {
    if (['discussion', 'bug', 'story', 'task'].includes(label.name)) {
      types.push(label.name)
    }
  })
  types.sort()
  return types.join['-']
}
