// Which transcript message holds a passage, for quotes whose selection named no message
// (the VS Code panel reports the text alone). Filled as the surface draws Claude's replies;
// a module value, so a reload starts it empty until the replies are drawn again.

const textById = new Map<string, string>()

// Letters and digits only: the reply arrives as markdown, the selection as the drawn text,
// so `**Use**`, list bullets and line breaks must not stop a match.
const comparable = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')

export const rememberReply = (requestId: string, text: string) => {
  textById.delete(requestId)
  textById.set(requestId, comparable(text))
}

/** The newest drawn reply that holds `passage`, if any. */
export const findReply = (passage: string): string | undefined => {
  const wanted = comparable(passage)
  if (!wanted) return undefined

  return [...textById].reverse().find(([, text]) => text.includes(wanted))?.[0]
}
