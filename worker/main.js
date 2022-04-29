require('dotenv').config()
const express = require('express')
const MULT = process.env.MULT !== undefined ? process.env.MULT : true
const ADD = process.env.ADD !== undefined ? process.env.ADD : true
const app = express()
const port = process.env.PORT || 8000
const randInt = (min, max) => Math.floor(Math.random() * (max - min)) + min
let mult = false
let add = false
let task = {}

app.use(express.json())
app.use(
  express.urlencoded({
    extended: true,
  })
)

if (MULT)
  app.post('/mult', (req, res) => {
    if (mult) {
      console.error('mult', 'Already working')
      res.status(403).send('Already working')
      return
    }
    mult = true
    const { a, b } = req.body
    task = { a, b }
    console.log('mult', req.body)
    const duration = randInt(3000, 12000)
    setTimeout(() => {
      mult = false
      res.send(JSON.stringify({ res: a * b, duration }))
    }, duration)
  })

if (ADD)
  app.post('/add', (req, res) => {
    if (add) {
      console.error('add', 'Already working')
      res.status(403).send('Already working')
      return
    }
    add = true
    const { a, b } = req.body
    task = { a, b }
    console.log('add', req.body)
    const duration = randInt(3000, 7000)
    setTimeout(() => {
      add = false
      res.send(JSON.stringify({ res: a + b, duration }))
    }, duration)
  })

app.get('/', (req, res) => {
  if (mult) {
    res.send(JSON.stringify({ type: 'mult', task }))
    return
  }
  if (add) {
    res.send(JSON.stringify({ type: 'add', task }))
    return
  }
  res.send('ready to work')
})

app.listen(port, () => {
  console.log(`Worker listening at http://localhost:${port}`)
})
