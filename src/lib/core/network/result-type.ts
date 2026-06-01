export type Result<Value, ErrorValue = string> =
  | { ok: true; value: Value }
  | { ok: false; error: ErrorValue }

export function ok<Value, ErrorValue = string>(value: Value): Result<Value, ErrorValue> {
  return { ok: true, value }
}

export function error<Value, ErrorValue = string>(error: ErrorValue): Result<Value, ErrorValue> {
  return { ok: false, error }
}
