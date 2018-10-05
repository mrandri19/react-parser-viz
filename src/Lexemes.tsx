import * as React from "react"

function Lexeme(props: { element: Lexeme | Highlighted<Lexeme> }) {
  let hl = "";
  if ((props.element as Highlighted<Lexeme>).highlighted) {
    hl = "highlighted"
  }
  switch (props.element.type) {
    case "eof":
      return (
        <div className={`lexeme eof ${hl}`}>
          <span>EOF</span>
        </div>
      )
    case "op":
      return (
        <div className={`lexeme op ${hl}`}>
          <span>{props.element.value}</span>
        </div>
      )
    case "digit":
      return (
        <div className={`lexeme digit ${hl}`}>
          <span>{props.element.value}</span>
        </div>
      )
  }
}

export function Lexemes(props: { elements: Array<(Lexeme | Highlighted<Lexeme>)> }) {
  const lexemes = props.elements.map((lx, i) => <Lexeme element={lx} key={i + lx.type} />)
  return <div className="lexemes">{lexemes}</div>
}
