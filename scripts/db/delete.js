const mysql = require('mysql2');  

require('dotenv').config();

const { 
  NATTER_DB_USER, 
  NATTER_DB_PASS, 
  NATTER_DB_HOST,
  NATTER_DB_DEV_DB_NAME,
  NATTER_DB_TEST_DB_NAME,
  NODE_ENV
} = process.env;

const dbName = NODE_ENV === "development" 
  ? NATTER_DB_DEV_DB_NAME 
  : NATTER_DB_TEST_DB_NAME;

const connection = mysql.createConnection({  
  host: NATTER_DB_HOST,  
  user: NATTER_DB_USER,  
  password: NATTER_DB_PASS 
});  

connection.connect((err) => {
  if (err) throw err;
  connection.query(`DROP SCHEMA ${dbName}`, (err, result) => {
    if (err && err.code === "ER_DB_DROP_EXISTS") {
      console.log("Already deleted");
      process.exit(0);
    }

    if (err) throw err;

    console.log('Deleted db');
    process.exit(0);
  })
})