require('dotenv').config();
const fetch = require('node-fetch');
const express = require('express');
const { v4 } = require('uuid');
const id = v4();
console.log(id);

const PLANNER = process.env.PLANNER || 'http://localhost:3000';
const WORKER_TYPE = process.env.WORKER_TYPE || 'general'; // Par défaut généraliste
const app = express();
const port = process.env.PORT || 8080;
const ADDRESS = process.env.ADDRESS || `http://localhost:${port}`;

const randInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const register = () => {
  fetch(`${PLANNER}/register`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: ADDRESS, id }),
  }).catch((err) => {
    console.error('Failed to register worker:', err.message);
  });
};

let busy = false; // Utilisation d'une seule variable pour indiquer l'état occupé
let task = {};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const handleTask = (req, res, type) => {
  if (busy) {
    console.error(type, 'Already working');
    res.status(403).send('Already working');
    return;
  }
  busy = true;
  const { a, b } = req.body;
  task = { a, b };
  console.log(type, req.body);
  const duration = randInt(3000, 12000);
  setTimeout(() => {
    busy = false;
    res.send(JSON.stringify({ res: type === 'mult' ? a * b : a + b, duration, id }));
  }, duration);
};

if (WORKER_TYPE === 'multiplication' || WORKER_TYPE === 'general') {
  app.post('/mult', (req, res) => handleTask(req, res, 'mult'));
}

if (WORKER_TYPE === 'addition' || WORKER_TYPE === 'general') {
  app.post('/add', (req, res) => handleTask(req, res, 'add'));
}

app.get('/', (req, res) => {
  if (busy) {
    res.send(JSON.stringify({ type: WORKER_TYPE, task, id }));
    return;
  }
  res.send(`ready to work ${id}`);
});

app.listen(port, () => {
  register(); // Enregistrement du worker au démarrage
  console.log(`Worker ${id} listening at http://localhost:${port}`);
});
