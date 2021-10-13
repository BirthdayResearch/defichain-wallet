/* eslint-disable no-restricted-imports */
import { truncate } from 'lodash'
import NextHead from 'next/head'
import { PropsWithChildren } from 'react'

interface HeadProps {
  title?: string
  description?: string
}

/**
 * Overrides the default next/head to provide ability insert consistent open graph tags.
 *
 * @param {string} [props.title] added to <title> and <meta og:title> with " • DeFi Scan – ..." postfix
 * @param {string} [props.description] added to <meta og:description> and <meta :description>
 */
export function Head (props: PropsWithChildren<HeadProps>): JSX.Element {
  const title = props.title !== undefined ? `${props.title} • DeFiChain Wallet` : undefined
  const description = truncate(props.description, { length: 220 })

  return (
    <NextHead>
      {title !== undefined && (
        <>
          <title key='title'>{title}</title>
          <meta key='og:title' name='og:title' content={title} />
        </>
      )}

      {description !== undefined && (
        <>
          <meta key='description' name='description' content={description} />
          <meta key='og:description' name='og:description' content={description} />
        </>
      )}

      {props.children}
    </NextHead>
  )
}
