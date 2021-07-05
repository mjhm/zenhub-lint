const core = require('@actions/core');
const github = require('@actions/github');
const https = require('https');
const { zenhubLint } = require('./zenhub-lint.js')

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`3. The event payload: ${payload}`);
  console.log('3 sending get request')
  zenhubLint()
  .then(report => {
    console.log('report', report)
  })

  
} catch (error) {
  core.setFailed(error.message);
}
