
const github = require('@actions/github');

export const getIssues = async () => {
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
  const q = 'repo:Originate/perfected+is:issue+is:open'
  return octokit.rest.search.issuesAndPullRequests({ q });
}

export const getIssueType = issue => {
  const types = []
  console.log('h4')
  (issue.labels || []).forEach(label => {
    if (['discussion', 'bug', 'task', 'story'].includes(label.name)) {
      types.push(label.name)
    }
  })
  return types.length === 1 ? types[0] : types.length === 0 ? null : types
}