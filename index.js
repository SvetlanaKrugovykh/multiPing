require('dotenv').config()
const Fastify = require('fastify')
const ping = require('ping')
const fs = require('fs')
const path = require('path')

const fastify = Fastify({ logger: true });
const IPS = process.env.IPS.split(',');
const PING_INTERVAL = Number(process.env.PING_INTERVAL) || 1000
const DELAY_THRESHOLD = Number(process.env.DELAY_THRESHOLD) || 100
const ALLOW_IPS = process.env.ALLOW_IPS ? process.env.ALLOW_IPS.split(',') : []
const SOURCE_IP = process.env.SOURCE_IP

const logFile = path.join(__dirname, 'ping.log')
fs.writeFileSync(logFile, '') // Reset log file on server start

let pingResults = {}
IPS.forEach(ip => pingResults[ip] = [])

function logPing(ip, result) {
  fs.appendFileSync(logFile, `${new Date().toISOString()} ${ip} ${JSON.stringify(result)}\n`)
}

function getColor(status, time) {
  if (!status) return 'red'
  if (time > DELAY_THRESHOLD) return 'yellow'
  return 'green'
}

async function doPing() {
  for (const ip of IPS) {
    try {
      const pingOptions = { timeout: 2 }
      if (SOURCE_IP) {
        pingOptions.sourceAddr = SOURCE_IP
      }
      const res = await ping.promise.probe(ip, pingOptions)
      const time = res.alive ? res.time : null
      const color = getColor(res.alive, time)
      const entry = { time: Date.now(), delay: time, color }
      pingResults[ip].push(entry)
      logPing(ip, entry)
    } catch (e) {
      const entry = { time: Date.now(), delay: null, color: 'red' }
      pingResults[ip].push(entry)
      logPing(ip, entry)
    }
  }
}

setInterval(doPing, PING_INTERVAL)

// IP whitelist middleware
fastify.addHook('preHandler', async (request, reply) => {
  if (ALLOW_IPS.length > 0) {
    const clientIP = request.ip || request.headers['x-forwarded-for'] || request.raw.remoteAddress
    const isAllowed = ALLOW_IPS.some(allowedIP =>
      clientIP.includes(allowedIP) || allowedIP === '127.0.0.1' && clientIP.includes('127.0.0.1')
    )
    if (!isAllowed) {
      reply.code(403).send({ error: 'Access denied' })
      return
    }
  }
})

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/',
})

fastify.get('/api/ping', async (req, reply) => {
  reply.send(pingResults)
})

fastify.listen({ port: process.env.PORT || 3000, host: process.env.HOST || '0.0.0.0' }, err => {
  if (err) throw err
  console.log(`Server running on http://${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 3000}`)
})
