
import https from 'https';

const authHeader = {
  headers: {
    'X-Authentication-Token': process.env.ZENHUB_TOKEN
  }
}

const repoPath = `repositories/${process.env.REPO_ID}`

let allSwimlanes = null

export const getSwimlanes = async () => {
  return new Promise((resolve, reject) => {
    if (allSwimlanes) return resolve(allSwimlanes)

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
            console.log(parsedData);
            resolve(parsedData)

          // allSwimlanes = _.fromPairs(
          //   (result.data.pipelines || []).map(pipeline =>
          //     [pipeline.name, pipeline.id]
          //   )
          // )
          } catch (e) {
            reject(e)
          }
        });
      }
    )
    })
  // const result = await axios.get(
  //   `https://api.zenhub.com/p1/${repoPath}/board`,
  //   authHeader
  // )
  // allSwimlanes = _.fromPairs(
  //   (result.data.pipelines || []).map(pipeline =>
  //     [pipeline.name, pipeline.id]
  //   )
  // )
  // return allSwimlanes
}