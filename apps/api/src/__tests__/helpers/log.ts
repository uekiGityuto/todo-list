import { Writable } from "node:stream";

export type LogEntry = Record<string, unknown>;

export function createLogCapture(): {
  logs: LogEntry[];
  stream: Writable;
} {
  const logs: LogEntry[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      logs.push(JSON.parse(chunk.toString()));
      callback();
    },
  });
  return { logs, stream };
}
