import { execFileSync } from 'node:child_process';

/* Thin wrapper over the agent-browser CLI: one command per call, JavaScript through stdin, JSON back. */
export const browserRun = (...args: string[]): string =>
  execFileSync('agent-browser', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });

interface EvalEnvelope<T> {
  success: boolean;
  data?: { result: T };
  error?: string | null;
}

export const browserEval = <T = unknown>(script: string): T => {
  const output = execFileSync('agent-browser', ['eval', '--stdin', '--json'], {
    input: script,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'inherit'],
  });
  const envelope = JSON.parse(output) as EvalEnvelope<T>;

  if (!envelope.success || !envelope.data) throw new Error(envelope.error ?? `eval failed: ${script}`);

  return envelope.data.result;
};

const POLL_MS = 50;

/* Polls a page expression until it is truthy; the wait runs inside the page so one round trip covers it. */
export const waitInPage = (expression: string, timeoutMs: number): void => {
  const settled = browserEval<boolean>(
    `(async () => { const started = Date.now(); while (Date.now() - started < ${timeoutMs}) { if (${expression}) return true; await new Promise((r) => setTimeout(r, ${POLL_MS})); } return false; })()`,
  );

  if (!settled) throw new Error(`timed out waiting for: ${expression}`);
};
