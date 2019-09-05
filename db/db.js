var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'hackathon',
    password: 'hackathon',
    database: 'hackathon'
});

module.exports = connection;

