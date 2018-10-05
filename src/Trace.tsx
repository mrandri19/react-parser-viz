import * as React from "react"
export function Trace(tr: Trace) {
  const { type, position } = tr
  const [line, col] = position

  return (
    <div>
      <code>({line}:{col}) - {type}</code>
    </div>
  )
}
