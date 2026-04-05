import express from 'express';
import cors from 'cors';
import { Pool as postgresPool } from 'pg';
import 'dotenv/config';

const app = express();
import bodyParser from 'body-parser';
const port = process.env.PORT || 3005;
app.use(cors());
// app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


const pool = new postgresPool({
  user: "postgres",
  password: process.env.DB_PASSWORD,
  database: "student_master",
  host: "localhost",
  port: 5432,
  max: 10
});

// pool.connect((err, connection) => {
//   if (err) {
//     console.error('Connection error:', err.message);
//     return;
//   }
//   console.log('Connected to student_master DB ^_^');
//   connection.release(); // Освобождава клиента обратно в пула
// });
// Тест за връзката при стартиране
pool.query('SELECT NOW()', (err, result) => {
  if (err) { console.error('Database connection error:', err.message); }
  else { console.log('Connected to student_master DB ^_^'); }
});

app.get('/students', (req, res) => {
  const sql = "SELECT * FROM student";
  pool.query(sql, (err, result) => {
    if (err) { return res.json(err); }
    return res.status(200).json(result.rows)
  });
});

app.get('/students/:studentId', (req, res) => {
  const stdId = Number(req.params.studentId);
  const sql = "SELECT * FROM student WHERE studentid=$1";
  pool.query(sql, [stdId], (err, result) => {
    if (err) { return res.json(err); }
    return res.status(200).json(result.rows[0]);
  });
});

app.post('/students', (req, res) => {
  const { name, major, email } = req.body;
  // валидация
  if (!name || !major || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const sql = "INSERT INTO student(name, major,email) VALUES($1,$2,$3) RETURNING *";
  pool.query(sql, [name, major, email], (err, result) => {
    if (err) { return res.json(err); }
    return res.status(201).json(result.rows[0]);
  });
});

app.patch('/students/:studentId', (req, res) => {
  const stdId = Number(req.params.studentId);
  const { name, major, email } = req.body;
  // валидация
  if (!name || !major || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const sql = "UPDATE student SET name=$1,major=$2,email=$3 WHERE studentid=$4";
  pool.query(sql, [name, major, email, stdId], (err, result) => {
    if (err) { return res.json(err); }
    return res.status(200).send(`Student id ${stdId} updated successfully`);
  });
});

app.delete('/students/:studentId', (req, res) => {
  const stdId = Number(req.params.studentId);

  const sql = "DELETE FROM student WHERE studentid=$1";
  pool.query(sql, [stdId], (err, result) => {
    if (err) { return res.json(err); }
    return res.status(200).send(`Student id ${stdId} is deleted successfully`);
  });
});


app.listen(port, (err) => {
  if (err) throw err;
  console.log(`Server is running on port ${port}`);
});