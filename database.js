const { pool } = require("./connection.js");
const logger = require("./lib/logger.js");
async function initDb(table) {
  try {
  await pool.query(`
  CREATE TABLE IF NOT EXISTS ${table} (
    transaction_sent_time TIMESTAMP,
    event_data BIGINT,
    timestamp_argument BIGINT,
    event_received_time TIMESTAMP,
    latency_ms BIGINT GENERATED ALWAYS AS (
      EXTRACT(EPOCH FROM (event_received_time - transaction_sent_time)) * 1000
    ) STORED,
    created_at TIMESTAMP DEFAULT NOW()
  );
`);


  } catch (err) {
    console.log(err);
    logger.error("Failed to initialize DB schema", err);
    process.exit(1);
  }
}

module.exports = { initDb };

