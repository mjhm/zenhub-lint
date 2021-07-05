
const core = require('@actions/core');
const github = require('@actions/github');
const https = require('https');

import { getSwimlanes, getAllDependencies } from './zenhub.js'
import { getIssues } from './github.js'

export const zenhubLint = async () => {
  const swimlanes = await getSwimlanes()
  const dependencies = await  getAllDependencies()
  const issues = await getIssues()

  console.log('ALL ' + JSON.stringify({
    swimlanes,
    dependencies,
    issues
  }, null, 2))
  return "Zenhub Lint Report"
}