import type { DestinationStream } from "pino";
import pino from "pino";

const REDACT_PATHS = [
  "authorization",
  "cookie",
  '["set-cookie"]',
  "password",
  "accessToken",
  "refreshToken",
  "token",
  "*.authorization",
  "*.cookie",
  '*["set-cookie"]',
  "*.password",
  "*.accessToken",
  "*.refreshToken",
  "*.token",
];

function serializeError(err: unknown): unknown {
  if (!err || typeof (err as Record<string, unknown>).message !== "string") {
    return err;
  }
  const e = err as Error;
  return { message: e.message, name: e.name, stack: e.stack };
}

type LoggerOptions = {
  level: string;
  destination: DestinationStream;
};

export function createLogger(options: LoggerOptions): pino.Logger {
  return pino(
    {
      level: options.level,
      base: undefined,
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level(label) {
          return { level: label };
        },
      },
      serializers: {
        err: serializeError,
      },
      redact: REDACT_PATHS,
    },
    options.destination,
  );
}

function resolveDestination(): DestinationStream {
  if (process.env.LOG_PRETTY === "true") {
    return pino.transport({ target: "pino-pretty" });
  }
  return pino.destination(1);
}

export const logger = createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  destination: resolveDestination(),
});
