type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogMetadata = Record<string, unknown>;

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const environment = process.env.NODE_ENV || 'development';
const configuredLevel = (process.env.LOG_LEVEL || (environment === 'production' ? 'info' : 'debug')) as LogLevel;
const minimumLevel = levelPriority[configuredLevel] ? configuredLevel : 'info';

const sensitiveKeyPattern =
  /(password|token|secret|authorization|cookie|api[_-]?key|database[_-]?url|connection[_-]?string|service[_-]?role)/i;

const sanitize = (value: unknown): unknown => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      ...(environment !== 'production' && value.stack ? { stack: value.stack } : {}),
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as LogMetadata).map(([key, entryValue]) => [
        key,
        sensitiveKeyPattern.test(key) ? '[REDACTED]' : sanitize(entryValue),
      ]),
    );
  }

  return value;
};

const shouldLog = (level: LogLevel) =>
  levelPriority[level] >= levelPriority[minimumLevel];

const writeLog = (level: LogLevel, message: string, metadata: LogMetadata = {}) => {
  if (!shouldLog(level)) return;

  const safeMetadata = sanitize(metadata) as LogMetadata;
  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    environment,
    ...safeMetadata,
  };

  const serialized = JSON.stringify(logEntry);

  if (level === 'error') {
    console.error(serialized);
    return;
  }

  if (level === 'warn') {
    console.warn(serialized);
    return;
  }

  console.log(serialized);
};

export const logger = {
  debug: (message: string, metadata?: LogMetadata) => writeLog('debug', message, metadata),
  info: (message: string, metadata?: LogMetadata) => writeLog('info', message, metadata),
  warn: (message: string, metadata?: LogMetadata) => writeLog('warn', message, metadata),
  error: (message: string, metadata?: LogMetadata) => writeLog('error', message, metadata),
};

export const getLogEnvironment = () => environment;
