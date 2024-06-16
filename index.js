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

// 사용자 정보 가져오기
app.get('/user/:username', (req, res) => {
  const { username } = req.params;
  const query = 'SELECT * FROM users WHERE username = ?';
  connection.query(query, [username], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.json({ success: false, message: 'User not found' });
    }
  });
});

// 사용자 정보 업데이트
app.put('/user/:username', (req, res) => {
  const { username } = req.params;
  const { email, name, password } = req.body;
  const query = 'UPDATE users SET email = ?, name = ?, password = ? WHERE username = ?';
  connection.query(query, [email, name, password, username], (err, results) => {
    if (err) throw err;
    res.json({ success: true });
  });
});

// 사용자 삭제
app.delete('/user/:username', (req, res) => {
  const { username } = req.params;
  const query = 'DELETE FROM users WHERE username = ?';
  connection.query(query, [username], (err, results) => {
    if (err) throw err;
    res.json({ success: true });
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
