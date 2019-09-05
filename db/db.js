var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3308,
    user: 'hackathon',
    password: 'hackathon',
    database: 'hackathon'
});

function insert(table, content) {
    return new Promise(((resolve, reject) => {
        let keys = Object.keys(content);
        let placeholders = generatePreparedStatementPlaceholders(keys);
        connection.query(`insert into ${table}(${keys}) values(${placeholders})`, Object.values(content), (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    }))
}

function all(table, columns) {
    return new Promise((resolve, reject) => {
       const columnKeys = columns.join(',');
       connection.query(`select ${columnKeys} from ${table}`, (err, result, fields) => {
           if (err) {
               reject(err);
           } else {
               resolve(result);
           }
       })
    });
}

function generatePreparedStatementPlaceholders(values) {
    let placeholders = '';
    for (let i = 0; i < values.length; i++) {
        placeholders += '?';
        if (i < values.length - 1) {
            placeholders += ','
        }
    }
    return placeholders;
}

module.exports = {
    connection,
    insert,
    all
};

