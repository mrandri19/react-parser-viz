import { ElementDefinition } from "cytoscape"

export function gen_elements_upto_current(
  traces: Trace[],
  current: number
): ElementDefinition[] {
  const elements = []

  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < current; i++) {
    const trace = traces[i]
    switch (trace.type) {
      case "drawEdge":
        {
          const { id, source, target } = trace
          const elem: ElementDefinition = {
            group: "edges",
            data: { id, source, target }
          }
          elements.push(elem)
        }
        break
      case "drawNode":
        {
          const { id, label } = trace
          const elem: ElementDefinition = {
            group: "nodes",
            // WARNING: I have edited the .d.ts definition of the graph to allow
            // having label in the data field
            data: { id, label }
          }
          elements.push(elem)
        }
        break
      case "setNodeLabel":
        {
          const { id, label } = trace
          const el = elements.find(e => e.data.id === id)
          if (!el) {
            throw new Error(`Trying to set the label of an unexistent node, label: ${id}`)
          }
          el.data.label = label
        }
        break
      default:
        break
    }
  }

  return elements
}
