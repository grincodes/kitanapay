function dbCon() {
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
      username: T_DB_USER,
      password: T_DB_PASS,
      database: T_DB_DEV_DB_NAME,
      host: T_DB_HOST,
      port: DB_PORT,
      type: 'postgres',
    },
    staging: {
      username: T_DB_USER,
      password: T_DB_PASS,
      database: T_DB_STG_DB_NAME,
      host: T_DB_HOST,
      port: DB_PORT,
      type: 'postgres',
    },
    production: {
      username: T_DB_USER,
      password: T_DB_PASS,
      database: T_DB_PROD_DB_NAME,
      host: T_DB_HOST,
      port: DB_PORT,
      type: 'postgres',
    },
  };

  return databaseCredentials[NODE_ENV];
}

function redisCon() {
  const { REDIS_HOST_URL, REDIS_HOST, REDIS_PORT, NODE_ENV } = process.env;

  const redisCredentials = {
    development: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },

    staging: {
      url: REDIS_HOST_URL,
    },

    production: {
      url: REDIS_HOST_URL,
    },
  };

  return redisCredentials[NODE_ENV];
}

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    ...dbCon(),
  },
  redis: {
    ...redisCon(),
  },
});
