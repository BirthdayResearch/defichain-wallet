
export interface GraphProps { pairId: string, a: string, b: string }
/**
 * To find all the adjacent vertices / neighbors of a node in a graph
 * @param startNode
 * @param graph
 */
export function getAdjacentVertices (startNode: string, graph: GraphProps[]): string[] {
  return (
    graph.reduce((vertices: string[], vertex): string[] => {
      if (vertex.a === startNode && vertex.b !== startNode) {
        return [...vertices, vertex.b]
      } else if (vertex.b === startNode && vertex.a !== startNode) {
        return [...vertices, vertex.a]
      }

      return vertices
    }, [])
  )
}

/**
 * This uses a modified Breadth First Search to store the first path found (by distance)
 * @param graph
 * @param start
 * @param target
 */
 export function findPath (graph: GraphProps[], origin: string, target: string): { visitedNodes: Set<string>, path: string[]} {
    let isPathFound = false
    let nodesToVisit = [origin]
    const visitedNodes = new Set<string>([]) // track visited nodes in a set
    let currentDistance = 0 // track distance from origin to target
    const path: string[] = [] // store the first path found by token

    bfs({
      start: {
        value: origin,
        edges: getAdjacentVertices(origin, graph)
      },
      target: target
    })

    function bfs ({ start, target }: { start: { value: string, edges: string[]}, target: string}): void {
      if (start.edges.length === 0 && start.value !== target) { // no possible path
        visitedNodes.add(start.value)
        return
      }

      if (!isPathFound) {
        path[currentDistance] = start.value
      }

      if (start.value === target) {
        isPathFound = true
        visitedNodes.add(start.value)
        nodesToVisit = []
        return
      }
      visitedNodes.add(start.value)

      while (nodesToVisit.length > 0) {
        currentDistance += 1
        nodesToVisit.shift()
        const nextNodeToVisitEdges = start.edges

        while (nextNodeToVisitEdges.length !== 0 && !isPathFound) {
          const startValue = nextNodeToVisitEdges[0]
          const innerStart = {
            value: startValue,
            edges: getAdjacentVertices(startValue, graph).filter(vertex => !visitedNodes.has(vertex))
          }
          const startEdgesToVisit = innerStart.edges

          nodesToVisit = [...nodesToVisit, ...startEdgesToVisit]
          bfs({
            start: innerStart,
            target: target
          })
          nextNodeToVisitEdges.shift()
        }
      }
    }

    return isPathFound
? {
      visitedNodes,
      path
    }
: {
      visitedNodes,
      path: []
    }
  }

  export const checkIfPair = (pair: {a: string, b: string}, a: string, b: string): boolean => ((pair.a === a && pair.b === b) || (pair.b === a && pair.a === b))
