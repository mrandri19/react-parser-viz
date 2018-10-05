// TODO: clean up: have all of the supporting code and the parser code separated

// tslint:disable-next-line:prefer-const
let ErrorStackParser: any
;(self as any).importScripts("error-stack-parser.min.js")

self.onmessage = msg => {
  const { data } = msg
  switch (data.type) {
    case "start":
      try {
        start(data.lexemes)
      } catch (error) {
        const c = self as any

        c.postMessage({ kind: "error", error: error.message })
      }
      break
    default:
      throw new Error("Unreachable switch arm")
  }
}

// tslint:disable-next-line:variable-name
function start(lexemes_: Lexeme[]) {
  let lexemes = lexemes_
  // tslint:disable-next-line:variable-name
  let __id = 0
  function getAstNodeId() {
    return __id++
  }
  // tslint:disable-next-line:variable-name
  let __edge_id = 0
  function get_edge_id() {
    return `e${__edge_id++}`
  }
  const traces: Trace[] = []

  function expr(nodeid: number): AST {
    const id = getAstNodeId()
    drawNode(id, `mult`)
    drawEdge(get_edge_id(), nodeid, id)

    const m = mult(id)

    const op = peek()
    if (op.type === "op" && (op.value === "+" || op.value === "-")) {
      consume(op)
      setNodeLabel(nodeid, `expr\n${op.value}`)

      const newId = getAstNodeId()
      drawNode(newId, `expr`)
      drawEdge(get_edge_id(), nodeid, newId)

      const e = expr(newId)

      return {
        type: "expr",
        lhs: m,
        op: op.value,
        rhs: e
      }
    } else {
      setNodeLabel(nodeid, `expr\n∅`)
      return m
    }
  }

  function mult(nodeid: number): AST {
    const id = getAstNodeId()

    drawNode(id, `digit`)
    drawEdge(get_edge_id(), nodeid, id)

    const d = digit(id)

    const op = peek()
    if (op.type === "op" && (op.value === "*" || op.value === "/")) {
      consume(op)
      setNodeLabel(nodeid, `mult\n${op.value}`)

      const newId = getAstNodeId()
      drawNode(newId, `mult`)
      drawEdge(get_edge_id(), nodeid, newId)

      const m = mult(newId)

      return {
        type: "mult",
        lhs: d,
        op: op.value,
        rhs: m
      }
    } else {
      setNodeLabel(nodeid, `mult\n∅`)
      return d
    }
  }

  function digit(nodeid: number): AST {
    const d = peek()

    if (d.type === "digit") {
      consume(d)

      setNodeLabel(nodeid, `digit\n${d.value}`)
      return {
        type: "digit",
        value: d.value
      }
    } else {
      throw new Error(`expected digit, got ${JSON.stringify(peek())} instead.`)
    }
  }

  const rootId = getAstNodeId()

  drawNode(rootId, `expr`)
  expr(rootId)
  consume({ type: "eof" })
  end()

  // ************************************

  function trace(actionData: Action) {
    const errors = ErrorStackParser.parse(new Error())

    const c = self as any

    const { lineNumber, columnNumber } = errors[2]

    c.postMessage({
      kind: "trace",
      position: [lineNumber, columnNumber],
      ...actionData
    })
  }

  function drawNode(id: number, label: string) {
    trace({
      type: "drawNode",
      id,
      label
    })
  }
  function drawEdge(id: string, source: number, target: number) {
    trace({
      id,
      source,
      target,
      type: "drawEdge"
    })
  }

  function consume(lex: Lexeme) {
    if (lexemes.length <= 0) {
      throw new Error("consuming an empty arr")
    }
    if (JSON.stringify(lexemes[0]) !== JSON.stringify(lex)) {
      throw new Error(
        `Tried to consume ${JSON.stringify(lex)}, found ${JSON.stringify(lexemes[0])}`
      )
    }
    lexemes = lexemes.slice(1)
    trace({
      type: "consume",
      newLexemes: lexemes
    })
    return null
  }

  function peek() {
    trace({
      type: "peek"
    })
    if (lexemes.length <= 0) {
      throw new Error("peeking an empty arr")
    }
    return lexemes[0]
  }

  function setNodeLabel(id: number, label: string) {
    trace({ type: "setNodeLabel", id, label })
  }

  function end() {
    const c = self as any
    c.postMessage({ kind: "end" })
  }

  return
}
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
