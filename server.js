require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const logger = require("./lib/logger.js");

const { runPeriodicRequest, handleEventReceive } = require("./controller/apiRequestContract.js");
const { initDb } = require("./database.js");
const { pool } = require("./connection.js");
const { Agent, setGlobalDispatcher } = require("undici");

// ================= Undici Agent =================
const agent = new Agent({ connect: { rejectUnauthorized: false } });
setGlobalDispatcher(agent);

// ================= Middlewares =================
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(session({ secret: "Secret_Key", resave: false, saveUninitialized: true }));
app.use(bodyParser.text());

// ================= ENV =================
const {
  SERVICE_NAME,
  SERVICE_PORT,
  TABLE_NAME,
  CHAIN,
  TIME_INTERVAL_MS,
} = process.env;

// ================= WEBHOOKS =================
const networks = [
  "amoy",
  "opSepolia",
  "fuji",
  "bnbTestnet",
  "sepolia",
  "celoSepolia",
  "baseSepolia",
];

networks.forEach((network) => {
app.post(`/${network}/dagRuns`, async (req, res) => {
  try {
    console.log("=================================");
    console.log(`[${network}] WEBHOOK RAW BODY`);
    console.log(JSON.stringify(req.body, null, 2));
    console.log("=================================");

    await handleEventReceive(TABLE_NAME, req.body, network);

    res.send("OK");
  } catch (err) {
    logger.error(`[${network}] Webhook error: ${err.message}`);
    res.status(500).send("Webhook failed");
  }
});
});


// ================= START SERVER =================
app.listen(SERVICE_PORT, async () => {
  logger.info(`${SERVICE_NAME} running on port ${SERVICE_PORT}`);

  // Initialize DB schema
  await initDb(TABLE_NAME);

  // Start periodic transaction sending
  runPeriodicRequest(CHAIN, TABLE_NAME, parseInt(TIME_INTERVAL_MS || 2000));
});