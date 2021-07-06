
import github from '@actions/github'
import { keyBy } from 'lodash'

let issues = null

export const getIssues = async () => {
  if (issues) return issues
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
  let totalCount = Number.MAX_SAFE_INTEGER
  let issuesArray = []
  let page = 0
  const q = 'repo:Originate/perfected+is:open'
  while (issues.length < totalCount) {
    const result = await octokit.rest.search.issuesAndPullRequests({ q, per_page: 100, page })
    issuesArray = [...issuesArray, ...result.data.items]
    totalCount = result.total_count || 0
    page += 1
    if (page > 100 || (((result || {}).data || {}).items || []).length === 0) {
      throw new Error('Bad issue search')
    }
  }
  issues = keyBy(issuesArray, 'number')
  return issues
}

export const getIssueType = issue => {
  const types = []
  if (issue.pull_request) {
    types.push('pr')
  }
  (issue.labels || []).forEach(label => {
    if (['discussion', 'bug', 'task', 'story'].includes(label.name)) {
      types.push(label.name)
    }
  })
  return types.length === 1 ? types[0] : types.length === 0 ? null : types
}
