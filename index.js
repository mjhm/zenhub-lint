const core = require('@actions/core');
const github = require('@actions/github');
const https = require('https');

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
  https.get("https://example.com", (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);
    res.on('data', (d) => {
      console.log('data', d)
    });
  })
  console.log('3 sent get request')
  
} catch (error) {
  core.setFailed(error.message);
}
