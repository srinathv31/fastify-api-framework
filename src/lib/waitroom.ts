// src/lib/waitroom.ts
type Pending = {
  resolve: (v: any) => void;
  reject: (e: any) => void;
  timeout: NodeJS.Timeout;
};

const pending = new Map<string, Pending>();

export function createWait(correlationId: string, ms: number) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(correlationId);
      const err = new Error("Process timeout") as any;
      err.code = "TIMEOUT";
      reject(err);
    }, ms);
    pending.set(correlationId, { resolve, reject, timeout });
  });
}

export function completeWait(correlationId: string, payload: any) {
  const p = pending.get(correlationId);
  if (!p) return false;
  clearTimeout(p.timeout);
  pending.delete(correlationId);
  p.resolve(payload);
  return true;
}

export function failWait(correlationId: string, err: any) {
  const p = pending.get(correlationId);
  if (!p) return false;
  clearTimeout(p.timeout);
  pending.delete(correlationId);
  p.reject(err);
  return true;
}

export function clearAll(reason = "shutdown") {
  for (const [_correlationId, p] of pending) {
    clearTimeout(p.timeout);
    p.reject(new Error(`Aborted: ${reason}`));
  }
  pending.clear();
}
