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
  password: 'rjsgml0420', // 실제 비밀번호로 변경하세요
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
      res.json({ success: true, userId: results[0].id }); // userId 반환
    } else {
      res.json({ success: false });
    }
  });
});


// 새로운 이벤트 저장 엔드포인트 추가
app.post('/events', (req, res) => {
  const { userId, title, start, end, allDay } = req.body;

  // 날짜/시간을 MySQL 형식으로 변환하는 함수
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

  const insertEventQuery = 'INSERT INTO events (user_id, title, start, end, allDay) VALUES (?, ?, ?, ?, ?)';
  connection.query(insertEventQuery, [userId, title, formattedStart, formattedEnd, allDay], (err, results) => {
    if (err) throw err;
    res.json({ success: true });
  });
});

// 특정 사용자의 이벤트를 불러오는 엔드포인트 추가
app.get('/events/:userId', (req, res) => {
  const { userId } = req.params;
  const getEventsQuery = 'SELECT * FROM events WHERE user_id = ?';
  connection.query(getEventsQuery, [userId], (err, results) => {
    if (err) throw err;
    res.json({ success: true, events: results });
  });
});

// 이벤트 삭제 엔드포인트 추가
app.delete('/events/:eventId', (req, res) => {
  const { eventId } = req.params;
  const deleteEventQuery = 'DELETE FROM events WHERE id = ?';
  connection.query(deleteEventQuery, [eventId], (err, results) => {
    if (err) throw err;
    res.json({ success: true });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(query, [username, password], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.json({ success: false });
    }
  });
});

app.get('/user/:username', (req, res) => {
  const { username } = req.params;
  const query = 'SELECT username, name, email FROM users WHERE username = ?';
  connection.query(query, [username], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.json({ success: false });
    }
  });
});

app.put('/user/:username', (req, res) => {
  const { username } = req.params;
  const { name, email, password } = req.body;
  const query = 'UPDATE users SET name = ?, email = ?, password = ? WHERE username = ?';
  connection.query(query, [name, email, password, username], (err, results) => {
    if (err) throw err;
    res.json({ success: true });
  });
});

// 회원 탈퇴 (사용자와 관련된 모든 이벤트 삭제 후 사용자 삭제)
app.delete('/user/:username', (req, res) => {
  const { username } = req.params;

  // 사용자 정보를 먼저 가져오기
  const getUserQuery = 'SELECT id FROM users WHERE username = ?';
  connection.query(getUserQuery, [username], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      const userId = results[0].id;

      // 해당 사용자의 이벤트를 먼저 삭제
      const deleteEventsQuery = 'DELETE FROM events WHERE user_id = ?';
      connection.query(deleteEventsQuery, [userId], (err, results) => {
        if (err) throw err;

        // 그 후 사용자를 삭제
        const deleteUserQuery = 'DELETE FROM users WHERE id = ?';
        connection.query(deleteUserQuery, [userId], (err, results) => {
          if (err) throw err;
          res.json({ success: true });
        });
      });
    } else {
      res.json({ success: false, message: 'User not found' });
    }
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
