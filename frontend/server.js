const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
app.use(cors());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'kevin',
    password: 'password',
    database: 'test',
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});

app.get('/data', (req, res) => {
    connection.query('SELECT * FROM data', (err, rows) => {
        if (err) throw err;
        res.json(rows);
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
