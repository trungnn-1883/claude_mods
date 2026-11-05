// Pure list operations and message building: no `$`, so tests need no engine.
import type { QuoteAnnotation } from '../types'

const renumber = (list: QuoteAnnotation[]): QuoteAnnotation[] =>
  list.map((quote, index) => ({ ...quote, order: index + 1 }))

export const addQuote = (
  list: QuoteAnnotation[],
  quote: Omit<QuoteAnnotation, 'order' | 'comments'>,
): QuoteAnnotation[] =>
  renumber([...list, { ...quote, comments: [], order: 0 }])

export const removeQuote = (list: QuoteAnnotation[], id: string) =>
  renumber(list.filter(quote => quote.id !== id))

export const moveQuote = (
  list: QuoteAnnotation[],
  id: string,
  delta: -1 | 1,
): QuoteAnnotation[] => {
  const from = list.findIndex(quote => quote.id === id)
  const to = from + delta
  const moving = list[from]
  if (from < 0 || to < 0 || to >= list.length || moving === undefined) {
    return list
  }
  const rest = list.filter((_, index) => index !== from)

  return renumber([...rest.slice(0, to), moving, ...rest.slice(to)])
}

const withComments = (list: QuoteAnnotation[], id: string, change: (comments: string[]) => string[]) =>
  list.map(quote => (quote.id === id ? { ...quote, comments: change(quote.comments) } : quote))

export const setQuoteText = (list: QuoteAnnotation[], id: string, selectedText: string) =>
  list.map(quote => (quote.id === id ? { ...quote, selectedText } : quote))

export const appendComment = (list: QuoteAnnotation[], id: string) =>
  withComments(list, id, comments => [...comments, ''])

export const setComment = (list: QuoteAnnotation[], id: string, index: number, text: string) =>
  withComments(list, id, comments => comments.map((one, at) => (at === index ? text : one)))

export const removeComment = (list: QuoteAnnotation[], id: string, index: number) =>
  withComments(list, id, comments => comments.filter((_, at) => at !== index))

/** Drops blank comments, which a field opened and left empty leaves behind. */
export const pruneComments = (list: QuoteAnnotation[]) =>
  list.map(quote =>
    quote.comments.every(one => one.trim()) ? quote : { ...quote, comments: quote.comments.filter(one => one.trim()) },
  )

/** The text on one line, cut to `max` characters with an ellipsis. */
export const summarize = (text: string, max: number) => {
  const line = text.replace(/\s+/g, ' ').trim()

  return line.length > max ? `${line.slice(0, max - 1)}…` : line
}

/**
 * The follow-up the composer sends, kept short to spend few tokens; empty when there is
 * nothing to send. Each quote is numbered with its comments listed under it:
 *
 *   Feedback:
 *
 *   1. > quoted line
 *      - comment
 *
 *   Overall: instruction
 */
export const buildFollowUp = (list: readonly QuoteAnnotation[], instruction: string): string => {
  if (list.length === 0) return ''
  const parts = list.map(quote => {
    const lines = quote.selectedText.trim().split('\n')
    const quoted = lines.map((line, at) => `${at === 0 ? `${quote.order}.` : '  '} > ${line}`)
    const comments = quote.comments.map(one => one.trim()).filter(Boolean).map(one => `   - ${one}`)

    return [...quoted, ...comments].join('\n')
  })
  const overall = instruction.trim()

  return ['Feedback:', ...parts, ...(overall ? [`Overall: ${overall}`] : [])].join('\n\n')
}
