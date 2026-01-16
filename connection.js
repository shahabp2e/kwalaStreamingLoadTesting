const config = require('./config.js');
const pkg = require('pg');
const { Pool } = pkg;

const pool = new Pool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port,
});

module.exports = { pool };