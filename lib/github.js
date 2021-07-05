
const github = require('@actions/github');

export const getIssues = async () => {
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
  const q = 'q=' + encodeURIComponent('repo:mjhm/zenhub-lint is:issue is:open')
  return octokit.rest.search.issuesAndPullRequests({ q });
}