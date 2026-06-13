type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown>;

type Logger = {
  debug: (event: string, context?: LogContext) => void;
  info: (event: string, context?: LogContext) => void;
  warn: (event: string, context?: LogContext) => void;
  error: (event: string, error?: unknown, context?: LogContext) => void;
};

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function normalizeLogLevel(value?: string): LogLevel {
  const normalized = value?.trim().toLowerCase();

  if (normalized === 'debug' || normalized === 'info' || normalized === 'warn' || normalized === 'error') {
    return normalized;
  }

  return 'info';
}

function shouldLog(level: LogLevel) {
  const configuredLevel = normalizeLogLevel(process.env.LOG_LEVEL);
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[configuredLevel];
}

function serializeError(error: unknown) {
  if (!error) {
    return null;
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
  };
}

function emitLog(level: LogLevel, scope: string, event: string, context?: LogContext, error?: unknown) {
  if (!shouldLog(level)) {
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    scope,
    event,
    ...(context ? { context } : {}),
    ...(error ? { error: serializeError(error) } : {}),
  };

  const line = JSON.stringify(payload);

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.log(line);
}

export function createLogger(scope: string): Logger {
  return {
    debug(event, context) {
      emitLog('debug', scope, event, context);
    },
    info(event, context) {
      emitLog('info', scope, event, context);
    },
    warn(event, context) {
      emitLog('warn', scope, event, context);
    },
    error(event, error, context) {
      emitLog('error', scope, event, context, error);
    },
  };
}
