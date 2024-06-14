const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0000', // 여기서 비밀번호를 실제 비밀번호로 바꿉니다.
  database: 'calendar_db'
});

connection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(query, [username, password], (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });
});

app.post('/register', (req, res) => {
  const { username, password, name, email } = req.body;
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  connection.query(checkQuery, [email], (checkError, checkResults) => {
    if (checkError) throw checkError;
    if (checkResults.length > 0) {
      res.json({ success: false, message: '이미 등록된 회원정보입니다.' });
    } else {
      const insertQuery = 'INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)';
      connection.query(insertQuery, [username, password, name, email], (insertError, insertResults) => {
        if (insertError) throw insertError;
        res.json({ success: true, message: '회원가입되었습니다.' });
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
