
import https from 'https';

const authHeader = {
  headers: {
    'X-Authentication-Token': process.env.ZENHUB_TOKEN
  }
}

const repoPath = `repositories/${process.env.REPO_ID}`



export const getSwimlanes = async () => {
  return new Promise((resolve, reject) => {
    https.get(`https://api.zenhub.com/p1/${repoPath}/board`,
      authHeader,
      res => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Request Failed: ${statusCode}`));
        }
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            resolve(parsedData.pipelines)
          } catch (e) {
            reject(e)
          }
        });
      }
    )
    }
  )
}


export const getAllDependencies = async () => {
  return new Promise((resolve, reject) => {
    https.get(`https://api.zenhub.com/p1/${repoPath}/dependencies`,
      authHeader,
      res => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Request Failed: ${statusCode}`));
        }
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const dependencies JSON.parse(rawData).dependencies.map(d => [ d.blocking.issue_number, d.blocked.issue_number]);
            resolve(dependencies)
          } catch (e) {
            reject(e)
          }
        });
      }
    )
    }
  )
}