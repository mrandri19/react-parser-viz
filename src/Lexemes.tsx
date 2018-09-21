import * as React from "react"

function Lexeme(props: { element: Lexeme }) {
  switch (props.element.type) {
    case "eof":
      return <p>EOF</p>
    case "op":
      return <p>Operation: {props.element.value}</p>
    case "digit":
      return <p>Digit: {props.element.value}</p>
  }
}

export function Lexemes(props: { elements: Lexeme[] }) {
  return (
    <>
      {props.elements.map((lx, i) => (
        <Lexeme element={lx} key={i} />
      ))}
    </>
  )
}
