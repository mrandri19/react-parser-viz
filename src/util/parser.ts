export function parser(
  lexemes: Lexeme[],
  success: (traces: Trace[]) => void,
  error: (err: Error) => void
) {
  const worker = new Worker("worker.js")

  const traces: Trace[] = []
  worker.onmessage = msg => {
    switch (msg.data.kind) {
      case "end":
        worker.terminate()
        return success(traces)
      case "error":
        return error(new Error(msg.data.error))
      case "trace":
        return traces.push(msg.data)
      default:
        throw new Error("Unreachable match arm")
    }
  }

  worker.postMessage({ type: "start", lexemes })
}
