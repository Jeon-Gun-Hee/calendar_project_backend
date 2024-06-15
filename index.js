const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0000', // 실제 비밀번호로 변경하세요
  database: 'calendar_db' // 실제 데이터베이스 이름으로 변경하세요
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database.');
});

app.post('/register', (req, res) => {
  const { username, name, email, password } = req.body;
  const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
  connection.query(checkUserQuery, [username], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.json({ success: false, message: '이미 등록된 회원입니다.' });
    } else {
      const insertUserQuery = 'INSERT INTO users (username, name, email, password) VALUES (?, ?, ?, ?)';
      connection.query(insertUserQuery, [username, name, email, password], (err, results) => {
        if (err) throw err;
        res.json({ success: true });
      });
    }
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(query, [username, password], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.json({ success: true, username }); // username 반환
    } else {
      res.json({ success: false });
    }
  });
});

app.post('/events', (req, res) => {
  const { username, title, start, end, allDay } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required' });
  }

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const hours = ('0' + d.getHours()).slice(-2);
    const minutes = ('0' + d.getMinutes()).slice(-2);
    const seconds = ('0' + d.getSeconds()).slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const formattedStart = formatDate(start);
  const formattedEnd = formatDate(end);

  const insertEventQuery = 'INSERT INTO events (username, title, start, end, allDay) VALUES (?, ?, ?, ?, ?)';
  connection.query(insertEventQuery, [username, title, formattedStart, formattedEnd, allDay], (err, results) => {
    if (err) throw err;
    res.json({ success: true });
  });
});

app.delete('/events/:id', (req, res) => {
  const eventId = req.params.id;
  const deleteEventQuery = 'DELETE FROM events WHERE id = ?';
  connection.query(deleteEventQuery, [eventId], (err, results) => {
    if (err) throw err;
    res.json({ success: true });
  });
});

app.get('/events/:username', (req, res) => {
  const username = req.params.username;
  const getEventsQuery = 'SELECT * FROM events WHERE username = ?';
  connection.query(getEventsQuery, [username], (err, results) => {
    if (err) throw err;
    res.json({ success: true, events: results });
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
