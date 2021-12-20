import { findPath, GraphProps } from './path-finding'

describe('Path Finding - Composite Swap', () => {
  it('should be able to find a path in an undirected graph', () => {
    const graphWithAtoBtoB: GraphProps[] = [
      { pairId: '1', a: 'CAT', b: 'ANIMAL' },
      { pairId: '2', a: 'ANIMAL', b: 'DOG' }
    ]
    const graphWithAtoBtoA: GraphProps[] = [
      { pairId: '1', a: 'CAT', b: 'ANIMAL' },
      { pairId: '2', a: 'DOG', b: 'ANIMAL' }
    ]

    const aToBToB = findPath(graphWithAtoBtoB, 'DOG', 'ANIMAL')
    const aToBToA = findPath(graphWithAtoBtoA, 'DOG', 'ANIMAL')
    expect(aToBToB.path).toEqual(['DOG', 'ANIMAL'])
    expect(aToBToB.visitedNodes).toEqual(new Set(['DOG', 'ANIMAL']))

    expect(aToBToA.path).toEqual(['DOG', 'ANIMAL'])
    expect(aToBToA.visitedNodes).toEqual(new Set(['DOG', 'ANIMAL']))
  })

  it('should stop visiting nodes once a path is found', () => {
    const graph: GraphProps[] = [
      { pairId: '1', a: 'POMSKY', b: 'DOG' },
      { pairId: '2', a: 'POODLE', b: 'DOG' },
      { pairId: '3', a: 'DOG', b: '4_LEGGED' },
      { pairId: '4', a: 'DOG', b: 'ANIMAL' }, // path found here
      { pairId: '5', a: 'DOG', b: 'PET' },
      { pairId: '6', a: 'PET', b: 'FUN' }
    ]
    const aToB = findPath(graph, 'POODLE', 'ANIMAL')
    expect(aToB.path).toEqual(['POODLE', 'DOG', 'ANIMAL'])
    expect(aToB.visitedNodes).toEqual(new Set(['POMSKY', 'POODLE', 'DOG', 'ANIMAL', '4_LEGGED']))
    expect(Array.from(aToB.visitedNodes)).toEqual(expect.not.arrayContaining(['PET', 'FUN']))
  })
})
