type Action =
  | {
      type: "consume"
      newLexemes: Lexeme[]
    }
  | {
      type: "peek"
    }
  | {
      type: "drawNode"
      id: number
      label: string
    }
  | {
      type: "drawEdge"
      id: string
      source: number
      target: number
    }
  | {
      type: "setNodeLabel"
      id: number
      label: string
    }
type Trace = {
  position: [number, number]
} & Action

type AST =
  | {
      type: "expr"
      lhs: AST
      op: "+" | "-"
      rhs: AST
    }
  | {
      type: "mult"
      lhs: AST
      op: "*" | "/"
      rhs: AST
    }
  | {
      type: "digit"
      value: number
    }
type Lexeme =
  | { type: "digit"; value: number }
  | { type: "op"; value: string }
  | { type: "eof" }
