const { Pool } = require('pg');

require('dotenv').config();

const {
  T_DB_USER,
  T_DB_PASS,
  T_DB_HOST,
  T_DB_DEV_DB_NAME,
  T_DB_STG_DB_NAME,
  T_DB_PROD_DB_NAME,
  DB_PORT,
  NODE_ENV,
} = process.env;

const databaseCredentials = {
  development: {
    user: T_DB_USER,
    password: T_DB_PASS,
    host: T_DB_HOST,
    port: DB_PORT,
    type: 'postgres',
  },
  staging: {
    user: T_DB_USER,
    password: T_DB_PASS,
    host: T_DB_HOST,
    port: DB_PORT,
    type: 'postgres',
  },
  production: {
    user: T_DB_USER,
    password: T_DB_PASS,
    host: T_DB_HOST,
    port: DB_PORT,
    type: 'postgres',
  },
};

const dbNames = {
  development: T_DB_DEV_DB_NAME,
  staging: T_DB_STG_DB_NAME,
  production: T_DB_PROD_DB_NAME,
};

const pool = new Pool({
  ...databaseCredentials[NODE_ENV],
});

pool.query(`CREATE DATABASE ${dbNames[NODE_ENV]}`, (err, result) => {
  if (err && err.code === '42P04') {
    console.log('Db already created');
    process.exit(0);
  }

  if (err) {
    throw err;
  }

  console.log('Created db');
  process.exit(0);
});

pool.on('connect', (client) => {
  console.log('Connected');
});
