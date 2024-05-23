require('dotenv').config();
const fetch = require('node-fetch');
const express = require('express');

const port = process.env.PORT || 3000;
const nbTasks = parseInt(process.env.TASKS, 10) || 20;

// Générer des entiers aléatoires et des types de tâches
const randInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;
const taskType = () => (randInt(0, 2) ? 'mult' : 'add');
const args = () => ({ a: randInt(0, 40), b: randInt(0, 40) });

// Générer des tâches
const generateTasks = (i) => new Array(i).fill(1).map(() => ({ type: taskType(), args: args() }));


let workers = ['http://worker-1:8080', 'http://worker-2:8080', 'http://worker-3:8080'];


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(JSON.stringify(workers));
});

app.post('/register', (req, res) => {
  const { url, id } = req.body;
  console.log(`Register: ajout du worker ${url} avec id: ${id}`);
  workers.push({ url, id });
  res.send('ok');
});

let tasks = generateTasks(nbTasks);
let taskToDo = nbTasks;

const wait = (milli) => new Promise((resolve) => setTimeout(resolve, milli));

const sendTask = async (worker, task) => {
  console.log(`=> ${worker.url}/${task.type}`, task);
  workers = workers.filter((w) => w.id !== worker.id); // Retirer temporairement le worker
  tasks = tasks.filter((t) => t !== task); // Retirer la tâche de la liste

  try {
    const response = await fetch(`${worker.url}/${task.type}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task.args),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }

    const res = await response.json();
    workers = [...workers, worker]; // Réajouter le worker
    taskToDo -= 1;
    console.log('---');
    console.log(nbTasks - taskToDo, '/', nbTasks, ':');
    console.log(task, 'a pour réponse', res);
    console.log('---');
    return res;

  } catch (err) {
    console.error(task, ' a échoué', err.message);
    tasks = [...tasks, task]; // Réajouter la tâche à la liste
    workers = [...workers, worker]; // Réajouter le worker en cas d'échec
  }
};

const main = async () => {
  console.log(tasks);
  while (taskToDo > 0) {
    await wait(100);
    if (workers.length === 0 || tasks.length === 0) continue;
    sendTask(workers[0], tasks[0]); // Pas besoin d'attendre sendTask
  }
  console.log('fin des tâches');
  server.close();
};

const server = app.listen(port, () => {
  console.log(`Le serveur d'enregistrement écoute à http://localhost:${port}`);
  console.log('début des tâches...');
  main();
});
