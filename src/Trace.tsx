import * as React from "react"
export function Trace(tr: Trace) {
  const { type, position } = tr
  const [line, col] = position
  return (
    <div>
      <p>Name - {type}</p>
      <p>
        Position - {line}:{col}
      </p>
    </div>
  )
}
