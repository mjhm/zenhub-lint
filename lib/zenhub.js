
import https from 'https'
import keyBy from 'lodash'

const authHeader = {
  headers: {
    'X-Authentication-Token': process.env.ZENHUB_TOKEN
  }
}

const repoPath = `repositories/${process.env.REPO_ID}`

let swimlanes = null

export const getSwimlanes = async () => {
  if (swimlanes) return swimlanes
  return new Promise((resolve, reject) => {
    https.get(`https://api.zenhub.com/p1/${repoPath}/board`,
      authHeader,
      res => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Request Failed: ${res.statusCode}`))
        }
        res.setEncoding('utf8')
        let rawData = ''
        res.on('data', (chunk) => { rawData += chunk })
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData)
            swimlanes = keyBy(parsedData.pipelines, 'name')
            resolve(swimlanes)
          } catch (e) {
            reject(e)
          }
        })
      }
    )
  })
}

let dependencies = null

export const getAllDependencies = async () => {
  if (dependencies) return dependencies
  return new Promise((resolve, reject) => {
    https.get(`https://api.zenhub.com/p1/${repoPath}/dependencies`,
      authHeader,
      res => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Request Failed: ${res.statusCode}`))
        }
        res.setEncoding('utf8')
        let rawData = ''
        res.on('data', (chunk) => { rawData += chunk })
        res.on('end', () => {
          try {
            const keyBlockedByValue = {}
            const keyBlockingValue = {}
            JSON.parse(rawData).dependencies.forEach(d => {
              const blocking = d.blocking.issue_number
              const blocked = d.blocked.issue_number
              if (!keyBlockedByValue[blocked]) {
                keyBlockedByValue[blocked] = []
              }
              keyBlockedByValue[blocked].push(blocking)

              if (!keyBlockingValue[blocking]) {
                keyBlockingValue[blocking] = []
              }
              keyBlockingValue[blocking].push(blocked)
            })
            dependencies = {
              keyBlockedByValue,
              keyBlockingValue
            }
            resolve(dependencies)
          } catch (e) {
            reject(e)
          }
        })
      }
    )
  })
}
