import { useEffect, EffectCallback, DependencyList, useRef } from 'react'

/**
 * This hook gets called only when the dependencies change but not during initial render.
 *
 * @param {EffectCallback} effect The `useEffect` callback function.
 * @param {DependencyList} deps An array of dependencies.
 *
 * @example
 * ```
 *  useNonInitialEffect(()=>{
 *      alert('Dependency changed!')
 * },[dependency])
 * ```
 */
export const useNonInitialEffect = (effect: EffectCallback, deps?: DependencyList): void => {
  const initialRender = useRef(true)

  useEffect(() => {
    let effectReturns
    if (initialRender.current) {
      initialRender.current = false
    } else {
      effectReturns = effect()
    }

    if ((effectReturns != null) && typeof effectReturns === 'function') {
      return effectReturns
    }
  }, deps)
}
