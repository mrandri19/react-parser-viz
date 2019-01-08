import * as React from "react"

import article from "./Article"
import Graph from "./Graph"
import { Lexemes } from "./Lexemes"
import { Trace } from "./Trace"
import hash from "./util/djb2"
import { gen_elements_upto_current } from "./util/gen_elements_upto_current"
import { lex } from "./util/lex"
import { parser } from "./util/parser"

const DELAY = 750

type State = Paused | Stopped | Playing

// tslint:disable-next-line:interface-name
interface Stopped {
  input: string
  kind: "Stopped"
  output:
    | {
        type: "success"
        lexemes: Lexeme[]
        traces: Trace[]
      }
    | { type: "lexer-error"; message: string }
    | { type: "parser-error"; message: string; lexemes: Lexeme[] }
}
// tslint:disable-next-line:interface-name
interface Paused {
  kind: "Paused"
  current: number
  traces: Trace[]
  lexemes: Lexeme[]
}
// tslint:disable-next-line:interface-name
interface Playing {
  kind: "Playing"
  current: number
  traces: Trace[]
  lexemes: Lexeme[]
}

class App extends React.Component<{}, State> {
  public state: Readonly<State> = {
    kind: "Stopped",
    input: "",
    output: {
      type: "success",
      lexemes: [{ type: "eof" }],
      traces: []
    }
  }

  private code: string | null = null
  private graphRef: React.RefObject<Graph>
  private inputRef: React.RefObject<HTMLInputElement>

  constructor(props: {}) {
    super(props)

    this.graphRef = React.createRef<Graph>()
    this.inputRef = React.createRef<HTMLInputElement>()

    const input = "1+2*3"
    try {
      const lexemes = lex(input)
      parser(
        lexemes,
        traces => {
          this.setState({
            kind: "Stopped",
            input,
            output: {
              type: "success",
              traces,
              lexemes
            }
          })
        },
        error => {
          this.setState({
            kind: "Stopped",
            input,
            output: { type: "parser-error", message: error.message, lexemes }
          })
        }
      )
    } catch (error) {
      this.setState({
        kind: "Stopped",
        input,
        output: { type: "lexer-error", message: error.message }
      })
    }

    this.handleNext = this.handleNext.bind(this)
    this.handlePrev = this.handlePrev.bind(this)
    this.handlePlay = this.handlePlay.bind(this)
    this.handleStop = this.handleStop.bind(this)
    this.handlePause = this.handlePause.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  public async componentDidMount() {
    const res = await fetch("worker.js")
    const code = await res.text()

    this.code = code
  }

  public render() {
    const lexemesJsx = (() => {
      switch (this.state.kind) {
        case "Stopped": {
          let elem
          switch (this.state.output.type) {
            case "lexer-error":
              elem = (
                <>
                  <h1>Lexer error</h1>
                  <p>{this.state.output.message}</p>
                </>
              )
              break
            case "parser-error":
              elem = (
                <>
                  <h1>Parser error: {this.state.output.message}</h1>
                  <Lexemes elements={this.state.output.lexemes} />
                </>
              )
              break
            case "success":
              elem = (
                <>
                  <Lexemes elements={this.state.output.lexemes} />
                </>
              )
              break
          }
          return (
            <>
              <input
                className="input"
                type="text"
                autoFocus={true}
                defaultValue={this.state.input}
                ref={this.inputRef}
                onChange={this.handleChange}
              />
              {elem}
            </>
          )
        }
        case "Paused": {
          return null
        }
        case "Playing": {
          return null
        }
      }
    })()

    const graphJsx = (() => {
      switch (this.state.kind) {
        case "Stopped": {
          if (this.state.output.type === "success") {
            // tslint:disable-next-line:variable-name
            const _traces = [...this.state.output.traces]
            const elements = gen_elements_upto_current(_traces, _traces.length)
            return (
              <>
                <button className="button" onClick={this.handlePlay}>
                  <span className="icon">
                    <i className="fas fa-play" />
                  </span>
                  <span>Play</span>
                </button>
                <Graph ref={this.graphRef} elements={elements} />
              </>
            )
          } else {
            return null
          }
        }
        case "Paused": {
          const { current } = this.state
          const traces = this.state.traces
          const { graphRef, handlePrev, handleNext } = this

          const elements = gen_elements_upto_current(traces, current)

          return (
            <>
              <p className="buttons">
                <button className="button" onClick={this.handleStop}>
                  <span className="icon">
                    <i className="fas fa-stop" />
                  </span>
                  <span>Stop</span>
                </button>
                <button className="button" onClick={this.handlePlay}>
                  <span className="icon">
                    <i className="fas fa-play" />
                  </span>
                  <span>Play</span>
                </button>
                <button
                  className="button"
                  onClick={handlePrev}
                  style={{ visibility: current > 0 ? "visible" : "hidden" }}
                >
                  <span className="icon">
                    <i className="fas fa-backward" />
                  </span>
                  <span>Backward</span>
                </button>
                <button
                  className="button"
                  onClick={handleNext}
                  style={{
                    visibility:
                      current < traces.length - 1 ? "visible" : "hidden"
                  }}
                >
                  <span className="icon">
                    <i className="fas fa-forward" />
                  </span>
                  <span>Forward</span>
                </button>
              </p>

              <Graph ref={graphRef} elements={elements} />
              <p>
                Current: {current + 1}/{traces.length}
              </p>
              {Trace(traces[current])}
            </>
          )
        }
        case "Playing": {
          const { graphRef, state } = this
          const { current } = state
          const traces = state.traces

          const elements = gen_elements_upto_current(traces, current)

          return (
            <>
              <p className="buttons">
                <button className="button" onClick={this.handleStop}>
                  <span className="icon">
                    <i className="fas fa-stop" />
                  </span>
                  <span>Stop</span>
                </button>
                <button className="button" onClick={this.handlePause}>
                  <span className="icon">
                    <i className="fas fa-pause" />
                  </span>
                  <span>Pause</span>
                </button>
              </p>

              <Graph ref={graphRef} elements={elements} />

              <p>
                Current: {current + 1}/{traces.length}
              </p>
              {traces.length > 0 ? Trace(traces[current]) : null}
            </>
          )
        }
      }
    })()

    const sourceCode = (() => {
      const highlighted = (() => {
        switch (this.state.kind) {
          case "Stopped":
            return null
          case "Paused":
          case "Playing":
            return JSON.parse(JSON.stringify(this.state.traces))
        }
      })()
      if (highlighted) {
        highlighted.splice(-1).map((trace: Trace) => trace.position)
      }

      if (this.code) {
        const code = this.code
          .split("// ************************************")[1]
          .split("// ************************************")
        return (
          <figure>
            <pre>
              <code>
                {code.map(line => (
                  <span key={hash(line)} className={""}>
                    {line}
                  </span>
                ))}
              </code>
            </pre>
          </figure>
        )
      } else {
        return null
      }
    })()

    function highlight(
      lexemes: Lexeme[],
      traces: Trace[],
      current: number
    ): Array<Highlighted<Lexeme>> {
      const highlightedLexemes = lexemes.map(lm => ({
        ...lm,
        highlighted: false
      }))
      for (let i = 0; i < current; ++i) {
        switch (traces[i].type) {
          case "peek":
            highlightedLexemes[0].highlighted = true
            break
          case "consume":
            highlightedLexemes.shift()
            break

          default:
            break
        }
      }
      return highlightedLexemes
    }

    const highlightedLexemesJsx = (() => {
      switch (this.state.kind) {
        case "Paused":
        case "Playing":
          const l = this.state.lexemes
          const hl = highlight(l, this.state.traces, this.state.current)
          return <Lexemes elements={hl} />
        case "Stopped":
          return null
      }
    })()

    return article(lexemesJsx, graphJsx, highlightedLexemesJsx, sourceCode)
  }

  private handleNext() {
    switch (this.state.kind) {
      case "Stopped":
        return
      case "Playing": {
        const { current, traces } = this.state

        // If we want to go out of bounds in the traces array stop (len: 3 => last index: 2)
        if (current === traces.length - 1) {
          return this.setState({
            kind: "Paused"
          })
        }

        this.setState({
          kind: "Playing",
          current: current + 1
        })

        setTimeout(() => this.handleNext(), DELAY)
        return
      }
      case "Paused": {
        const { current, traces } = this.state

        // If we want to go out of bounds in the traces array stop (len: 3 => last index: 2)
        if (current === traces.length - 1) {
          return
        }

        this.setState({
          kind: "Paused",
          current: current + 1
        })
        return
      }
      default:
        break
    }
  }

  private handlePrev() {
    switch (this.state.kind) {
      case "Stopped":
        return
      case "Playing": {
        const { current } = this.state

        // If we want to go out of bounds in the traces array stop (len: 3 => last index: 2)
        if (current === 0) {
          return
        }

        this.setState({
          kind: "Playing",
          current: current - 1
        })

        setTimeout(() => this.handlePrev(), DELAY)
        return
      }
      case "Paused": {
        const { current } = this.state

        // If we want to go out of bounds in the traces array stop (len: 3 => last index: 2)
        if (current === 0) {
          return
        }

        this.setState({
          kind: "Paused",
          current: current - 1
        })
        return
      }
      default:
        break
    }
  }

  private handlePlay() {
    this.setState((prevState, props) => {
      switch (prevState.kind) {
        case "Stopped": {
          if (prevState.output.type === "success") {
            const { traces, lexemes } = prevState.output

            setTimeout(() => this.handleNext(), DELAY)

            return {
              kind: "Playing",
              current: 0,
              traces,
              lexemes
            }
          }
          return
        }

        case "Paused": {
          return this.setState({
            kind: "Playing"
          })
        }
        default:
          return
      }
    })
  }

  private handlePause() {
    this.setState({
      kind: "Paused"
    })
  }

  private handleStop() {
    this.setState({
      kind: "Stopped"
    })
  }

  private handleChange() {
    const input = this.inputRef.current!!.value

    try {
      const lexemes = lex(input)
      parser(
        lexemes,
        traces => {
          this.setState({
            kind: "Stopped",
            input,
            output: { type: "success", lexemes, traces }
          })
        },
        error => {
          this.setState({
            kind: "Stopped",
            input,
            output: { type: "parser-error", message: error.message, lexemes }
          })
        }
      )
    } catch (error) {
      this.setState({
        kind: "Stopped",
        input,
        output: { type: "lexer-error", message: error.message }
      })
    }
  }
}

export default App
