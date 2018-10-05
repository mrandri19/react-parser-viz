// TODO: What if I used d3?
// TODO: use shouldComponentUpdate and intelligent tree diffing to have the graph only redraw the correct nodes
import * as cytoscape from "cytoscape"
import * as React from "react"

import dagre from "cytoscape-dagre"

const cyStyle = {
  height: "400px",
  display: "block"
}
interface IProps {
  elements: cytoscape.ElementDefinition[]
}

class Cytoscape extends React.Component<IProps> {
  private cy!: cytoscape.Core
  private ref: React.RefObject<HTMLDivElement>
  constructor(props: IProps) {
    super(props)
    this.ref = React.createRef<HTMLDivElement>()
  }

  public componentDidMount() {
    cytoscape.use(dagre)
    const cy = cytoscape({
      container: this.ref.current,
      layout: { name: "dagre" },
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "right",
            "text-wrap": "wrap",
            // tslint:disable-next-line:max-line-length
            "font-family": `"Ubuntu Mono", Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace`,
            color: "#222"
          }
        },

        {
          selector: "edge",
          style: {
            "curve-style": "bezier",
            width: 2,
            "target-arrow-shape": "triangle",
            "line-color": "#888",
            "target-arrow-color": "#888"
          }
        }
      ]
    })
    this.cy = cy
    cy.json({ elements: this.props.elements })
    cy.layout({ name: "dagre" }).run()
  }

  public shouldComponentUpdate() {
    return false
  }

  public componentWillReceiveProps(nextProps: IProps) {
    this.cy.json(nextProps)
    this.rerunGraphLayout()
  }

  public componentWillUnmount() {
    this.cy.destroy()
  }

  public getCy() {
    return this.cy
  }

  public render() {
    return <div style={cyStyle} ref={this.ref} />
  }

  private rerunGraphLayout() {
    this.cy.layout({ name: "dagre" }).run()
  }
}

export default Cytoscape
