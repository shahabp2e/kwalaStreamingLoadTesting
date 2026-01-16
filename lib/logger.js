const winston = require('winston');
const moment = require('moment-timezone');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path'); // Import path module

// Custom timestamp function for converting to IST
const istTimestamp = winston.format((info) => {
  info.timestamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
  return info;
});

const logFormat = winston.format.combine(
  winston.format.colorize(),
  istTimestamp(), // Custom timestamp function to use IST
  winston.format.align(),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: [${info.flow}] - ${info.message}`),
);

const logDirectory = path.join(__dirname, '../logs'); // Construct the log directory path

const transport = new DailyRotateFile({
  filename: path.join(logDirectory, 'logFile-%DATE%.log'), // Use path.join to create the full log file path
  datePattern: 'YYYY-MM-DD',
  // zippedArchive: true,
  // maxSize: '2000m',
  // maxFiles: '14d',
  prepend: true,
  level: 'info',
});

transport.on('rotate', function (oldFilename, newFilename) {
  // call function like upload to s3 or on cloud
});

const logger = winston.createLogger({
  format: logFormat,
  transports: [
    transport,
    new winston.transports.Console({
      level: 'info',
    }),
  ],
});

// Add custom methods kalpToEvm for the logger
logger.kalpToEvm = (message) => {
  logger.log({
    level: 'info',
    flow: 'kalpToEvm',
    message: message,
  });
};

// Add custom methods EvmToKalp for the logger
logger.evmToKalp = (message) => {
  logger.log({
    level: 'info',
    flow: 'evmToKalp',
    message: message,
  });
};

// Override level:'info' to have general as flow key
logger.info = (message) => {
  logger.log({
    level: 'info',
    flow: 'general',
    message: message,
  });
};

module.exports = logger;
