import * as React from "react"

import Graph from "./Graph"
import { Lexemes } from "./Lexemes"
import { Trace } from "./Trace"
import { gen_elements_upto_current } from "./util/gen_elements_upto_current"
import { lex } from "./util/lex"
import { parser } from "./util/parser"

type State = StillParsing | Paused | Stopped | Playing
// tslint:disable-next-line:interface-name
interface StillParsing {
  kind: "StillParsing"
}
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
}
// tslint:disable-next-line:interface-name
interface Playing {
  kind: "Playing"
  current: number
  traces: Trace[]
}

class App extends React.Component<{}, State> {
  public state: Readonly<State> = {
    kind: "StillParsing"
  }
  private worker!: Worker
  private graph: React.RefObject<Graph>
  private input: React.RefObject<HTMLInputElement>

  constructor(props: {}) {
    super(props)

    this.graph = React.createRef<Graph>()
    this.input = React.createRef<HTMLInputElement>()

    const input = "1+2*3-"
    try {
      const lexemes = lex(input)
      parser(
        lexemes,
        (traces, worker) => {
          this.worker = worker
          this.setState({
            kind: "Stopped",
            input,
            output: { type: "success", traces, lexemes }
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

  public componentWillUnmount() {
    this.worker!!.terminate()
  }

  public render() {
    switch (this.state.kind) {
      case "StillParsing":
        return <h1>Still Parsing</h1>
      case "Stopped":
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
                <h1>Parser-error</h1>
                <Lexemes elements={this.state.output.lexemes} />
              </>
            )
            break
          case "success":
            elem = (
              <>
                <h1>Success</h1>
                <button onClick={this.handlePlay}>Play</button>
                <Lexemes elements={this.state.output.lexemes} />
              </>
            )
            break
        }
        return (
          <>
            <h1>Stopped</h1>
            <input
              type="text"
              name=""
              id=""
              autoFocus={true}
              defaultValue={this.state.input}
              ref={this.input}
              onChange={this.handleChange}
            />
            {elem}
          </>
        )
      case "Paused": {
        const { traces, current } = this.state
        const { graph, handlePrev, handleNext } = this

        const elements = gen_elements_upto_current(traces, current)

        return (
          <>
            <h1>App</h1>
            <p>Paused</p>
            <p>
              Current: {current}/{traces.length}
            </p>
            <button onClick={this.handleStop}>Stop</button>
            <button onClick={this.handlePlay}>Play</button>
            <button
              onClick={handlePrev}
              style={{ visibility: current > 0 ? "visible" : "hidden" }}
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              style={{
                visibility: current < traces.length - 1 ? "visible" : "hidden"
              }}
            >
              Next
            </button>
            <Graph ref={graph} elements={elements} />

            {Trace(traces[current])}
          </>
        )
      }
      case "Playing": {
        const { traces, current } = this.state
        const { graph } = this

        const elements = gen_elements_upto_current(traces, current)

        return (
          <>
            <h1>App</h1>
            <p>State - {this.state.kind}</p>
            <p>
              Current: {current}/{traces.length}
            </p>
            <button onClick={this.handleStop}>Stop</button>
            <button onClick={this.handlePause}>Pause</button>
            <Graph ref={graph} elements={elements} />

            {traces.length > 0 ? Trace(traces[current]) : null}
          </>
        )
      }
    }
  }

  private handleNext() {
    switch (this.state.kind) {
      case "Stopped":
        return
      case "StillParsing":
        return
      case "Playing": {
        this.rerunGraphLayout()
        const { current, traces } = this.state

        // If we want to go out of bounds in the traces array stop (len: 3 => last index: 2)
        if (current === traces.length - 1) {
          return
        }

        this.setState({
          kind: "Playing",
          current: current + 1
        })

        setTimeout(() => this.handleNext(), 200)
        return
      }
      case "Paused": {
        this.rerunGraphLayout()
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
      case "StillParsing":
        return
      case "Playing": {
        this.rerunGraphLayout()
        const { current } = this.state

        // If we want to go out of bounds in the traces array stop (len: 3 => last index: 2)
        if (current === 0) {
          return
        }

        this.setState({
          kind: "Playing",
          current: current - 1
        })

        setTimeout(() => this.handlePrev(), 200)
        return
      }
      case "Paused": {
        this.rerunGraphLayout()
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
    if (this.state.kind === "Stopped") {
      if (this.state.output.type === "success") {
        setTimeout(() => {
          this.handleNext()
        }, 500)
        return this.setState({
          kind: "Playing",
          current: 0,
          traces: this.state.output.traces
        })
      } else {
        return
      }
    }
    if (this.state.kind === "Paused") {
      setTimeout(() => {
        this.handleNext()
      }, 500)
      return this.setState({
        kind: "Playing"
      })
    }
  }

  private handleStop() {
    this.setState({
      kind: "Stopped"
    })

    this.rerunGraphLayout()
  }
  private handlePause() {
    this.setState({
      kind: "Paused"
    })
    this.rerunGraphLayout()
  }

  private handleChange() {
    const input = this.input.current!!.value
    this.setState({
      kind: "StillParsing"
    })

    try {
      const lexemes = lex(input)
      parser(
        lexemes,
        (traces, worker) => {
          this.worker = worker
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
  private rerunGraphLayout() {
    const graph = this.graph.current
    if (graph) {
      const cy = graph.getCy()
      cy.layout({ name: "dagre" }).run()
    }
  }
}

export default App
