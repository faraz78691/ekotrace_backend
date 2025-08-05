const mysql = require('mysql2');
const util = require('util');

// var db_config = {
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     port:3306,
//     database: 'CarbonEmission'
// };
var db_config = {
    host: '13.200.247.29',
    user: 'jerry',
    password: 'jerrypassword',
    port:3306,
    database: 'CarbonEmission'
};

// var db_config = {
//   host: '172.19.1.68',
//   user: 'farnek',
//   password: 'Carbondata#2205',
//   port:3306,
//   database: 'CarbonEmission'
// };


var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config);

  connection.connect(function (err) {
    if (err) {
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    } else {
      connection.query(
        "SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'",
        function (err) {
          if (err) {
            console.error("Failed to set SQL mode:", err);
          } else {
            console.log("SQL mode updated for this session");
          }
        }
      );
      console.log("Connected to mysql Server!");
    }
  });

  connection.on('error', function (err) {
    console.log('Cannot be connect to Database due to', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

function makeDb() {
  return {
    query(sql, args) {
  
      // console.log(sql);
      return util.promisify(connection.query).call(connection, sql, args);
    },
    close() {
      console.log("db not connected to localhost");
      return util.promisify(connection.end).call(connection);
    }
  }
}

const db = makeDb();
module.exports = db;