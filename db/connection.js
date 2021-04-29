const mysql = require("mysql2");
const { MYSQL } = require("../config");

let db = mysql.createConnection({
  host: MYSQL.host,
  user: MYSQL.user,
  password: MYSQL.password,
  database: MYSQL.database,
});

db.connect((err) => {
  if (err) {
    console.log(err);
  }
});

module.exports = db.promise();
