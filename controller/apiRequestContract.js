require("dotenv").config();
const axios = require("axios");
const { pool } = require("../connection.js");
const logger = require("../lib/logger.js");
const https = require("https");

// ================= HTTPS AGENT =================
const agent = new https.Agent({ rejectUnauthorized: false });

// ================= ENV =================
const {
  FUNCTION_SIGNATURE,
  CONTRACT_ADDRESS,
  BACKEND_WALLET,
  RPC_URL,
  CHAIN_ID,
  TRANSACTION_API_URL,
} = process.env;

// ================= SEND TRANSACTION =================
async function sendTransactionRequest(chainName, tableName) {
  try { return;
    const  transactionSentTime = Date.now();

    // Build transaction payload
    const txBody = {
      functionSignature: FUNCTION_SIGNATURE,
      args: [transactionSentTime],
      rpcUrl: RPC_URL,
      contractAddress: CONTRACT_ADDRESS,
      backendWallet: BACKEND_WALLET,
      chainId: parseInt(CHAIN_ID),
    };


   const dbResult = await pool.query(
  `
  INSERT INTO ${tableName} (transaction_sent_time, timestamp_argument)
  VALUES ( NOW(), $1)
  ON CONFLICT DO NOTHING
  `,
  [transactionSentTime]);
  if (dbResult.rowCount === 0) {

    logger.error( 
        
      `[${chainName}] Failed to insert transaction into DB | timestamp_argument=${transactionSentTime}`
    );
    throw new Error("DB insert failed");
  }

    // POST transaction to backend
    const response = await axios.post(
      `${TRANSACTION_API_URL}/sendTransaction`,
      txBody,
      { headers: { "Content-Type": "application/json" }, httpsAgent: agent }
    );

    const queueId = response.data.queueId;
 
    

    logger.info(
      `[${chainName}] Transaction sent | queue_id=${queueId} | timestamp_argument=${transactionSentTime}`
    );

    return transactionSentTime;
  } catch (error) {
    logger.error(`[${chainName}] Error sending transaction: ${error.message}`);
  }
}

// ================= PERIODIC TRANSACTIONS =================
async function runPeriodicRequest(chainName, tableName, intervalMs = 2000) {
  console.log(`Starting periodic transactions for ${chainName} every ${intervalMs} ms`);

  // Initial request
  await sendTransactionRequest(chainName, tableName);

  // Interval calls
  setInterval(async () => {
    await sendTransactionRequest(chainName, tableName);
  }, intervalMs);
}

// ================= HANDLE EVENT RECEIVE =================
async function handleEventReceive(tableName, payload, networkName = "amoy") {
  try {
    logger.info(`[${networkName}] RAW payload: ${JSON.stringify(payload)}`);

    const rawValue = payload?.Value || payload?.timestamp_argument || payload?.event_data;
    if (!rawValue) throw new Error("Missing Value / event_data / timestamp_argument");

    const eventData = Number(rawValue);
    console.log("event_data:", eventData);
   

const result = await pool.query(
  `
  UPDATE ${tableName}
  SET
    event_data = $1,
    event_received_time = NOW()
  WHERE timestamp_argument = $1
  RETURNING *
  `,
  [eventData]
);
    
    console.log(result.rows[0]);
    
  } 
  catch (err) {
    logger.error(`[${networkName}] Error handling event receive: ${err.message}`);
  }
}

module.exports = {
  runPeriodicRequest,
  handleEventReceive,
};












// require("dotenv").config();
// const axios = require("axios");
// const https = require("https");

// const { pool } = require("../connection.js");
// const logger = require("../lib/logger.js");

// // ================= HTTPS AGENT =================
// // NOTE: rejectUnauthorized=false should be avoided in prod,
// // kept as-is to preserve current behavior
// const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// // ================= ENV =================
// const {
//   FUNCTION_SIGNATURE,
//   CONTRACT_ADDRESS,
//   BACKEND_WALLET,
//   RPC_URL,
//   CHAIN_ID,
//   TRANSACTION_API_URL,
// } = process.env;

// // ================= SEND TRANSACTION =================
// async function sendTransactionRequest(chainName, tableName) {
//   const transactionSentTime = Date.now();

//   try {
//     const txBody = {
//       functionSignature: FUNCTION_SIGNATURE,
//       args: [transactionSentTime],
//       rpcUrl: RPC_URL,
//       contractAddress: CONTRACT_ADDRESS,
//       backendWallet: BACKEND_WALLET,
//       chainId: Number(CHAIN_ID),
//     };

//     // Store transaction metadata
//     const dbResult = await pool.query(
//       `
//       INSERT INTO ${tableName} (transaction_sent_time, timestamp_argument)
//       VALUES (NOW(), $1)
//       ON CONFLICT DO NOTHING
//       `,
//       [transactionSentTime]
//     );

//     if (dbResult.rowCount === 0) {
//       logger.error(
//         `[${chainName}] DB insert skipped | timestamp_argument=${transactionSentTime}`
//       );
//       throw new Error("DB insert failed");
//     }

//     // Send transaction to backend
//     const response = await axios.post(
//       `${TRANSACTION_API_URL}/sendTransaction`,
//       txBody,
//       {
//         headers: { "Content-Type": "application/json" },
//         httpsAgent,
//       }
//     );

//     const queueId = response?.data?.queueId;

//     logger.info(
//       `[${chainName}] Transaction sent | queue_id=${queueId} | timestamp_argument=${transactionSentTime}`
//     );

//     return transactionSentTime;
//   } catch (err) {
//     logger.error(
//       `[${chainName}] Error sending transaction: ${err.message}`
//     );
//   }
// }

// // ================= PERIODIC TRANSACTIONS =================
// async function runPeriodicRequest(chainName, tableName, intervalMs = 2000) {
//   logger.info(
//     `[${chainName}] Starting periodic transactions every ${intervalMs} ms`
//   );

//   // Initial execution
//   await sendTransactionRequest(chainName, tableName);

//   setInterval(async () => {
//     try {
//       await sendTransactionRequest(chainName, tableName);
//     } catch (err) {
//       logger.error(
//         `[${chainName}] Periodic execution failed: ${err.message}`
//       );
//     }
//   }, intervalMs);
// }

// // ================= HANDLE EVENT RECEIVE =================
// async function handleEventReceive(tableName, payload, networkName = "amoy") {
//   try {
//     logger.info(
//       `[${networkName}] RAW payload: ${JSON.stringify(payload)}`
//     );

//     const rawValue =
//       payload?.Value ??
//       payload?.timestamp_argument ??
//       payload?.event_data;

//     if (!rawValue) {
//       throw new Error("Missing event timestamp value");
//     }

//     const eventData = Number(rawValue);

//     logger.debug(
//       `[${networkName}] Parsed event_data=${eventData}`
//     );

//     const result = await pool.query(
//       `
//       UPDATE ${tableName}
//       SET
//         event_data = $1,
//         event_received_time = NOW()
//       WHERE timestamp_argument = $1
//       RETURNING *
//       `,
//       [eventData]
//     );

//     if (result.rowCount === 0) {
//       logger.warn(
//         `[${networkName}] No matching row found | timestamp_argument=${eventData}`
//       );
//       return;
//     }

//     logger.info(
//       `[${networkName}] Event stored successfully | timestamp_argument=${eventData}`
//     );

//     logger.debug(result.rows[0]);
//   } catch (err) {
//     logger.error(
//       `[${networkName}] Error handling event receive: ${err.message}`
//     );
//   }
// }

// // ================= EXPORTS =================
// module.exports = {
//   runPeriodicRequest,
//   handleEventReceive,
// };

