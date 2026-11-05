// The mod's state and every action on it, shared by the commands and the pane.
import { atom, read, update } from 'claude-code'
import type { EngineInterface } from 'claude-code'

import type { QuoteAnnotation } from '../types'
import { findReply } from './transcript-index'
import { addQuote, appendComment, buildFollowUp, pruneComments, removeComment } from './quote-annotations'

export const PANE = 'quote-composer'
export const TITLE = 'Quotes'
export const INSTRUCTION_FIELD = 'instruction'
// No angle brackets: the VS Code panel drops `<text>` as if it were markup.
const NO_SELECTION =
  'Nothing selected. Select text in a reply first, or type /quote followed by the text, or use /quote-last.'

// Bump the shape tag when QuoteAnnotation's fields change.
const annotations = atom({ plugin: 'multi-quote', key: 'annotations' } as const, [], {
  shape: 'quotes-2',
})
const instruction = atom({ plugin: 'multi-quote', key: 'instruction' } as const, '')
const selected = atom({ plugin: 'multi-quote', key: 'selected' } as const, null)
const editing = atom({ plugin: 'multi-quote', key: 'editing' } as const, null)
const writing = atom({ plugin: 'multi-quote', key: 'writing' } as const, null)

export const commentField = (id: string, index: number) => `comment:${id}:${index}`

export type Added = { isAdded: true } | { isAdded: false; reason: string }

/** Adds a quote unless it is empty or repeats the newest one (a second press on the same selection). */
export async function add($: EngineInterface, text: string, responseId?: string): Promise<Added> {
  const selectedText = text.trim()
  if (!selectedText) return { isAdded: false, reason: 'The quote is empty.' }
  const list = await read($, annotations)
  if (list.at(-1)?.selectedText === selectedText) {
    return { isAdded: false, reason: 'That passage is already the latest quote.' }
  }
  const id = crypto.randomUUID()
  const sessionId = await $.session.id()
  await update($, annotations, current => addQuote(current, { id, sessionId, responseId, selectedText }))
  // Open the new quote, and its first comment field, so the person can write straight away.
  await update($, selected, () => id)
  await update($, editing, () => null)
  await startComment($, id)
  void $.ui.open({ id: PANE, title: TITLE })

  return { isAdded: true }
}

export async function addSelection($: EngineInterface): Promise<Added> {
  const selected = await $.ui.selection()
  if (selected === undefined) return { isAdded: false, reason: NO_SELECTION }

  return add($, selected.text, selected.requestId)
}

export async function addLastReply($: EngineInterface): Promise<Added> {
  const messages = await $.session.messages()
  const reply = messages.findLast(message => message.role === 'assistant' && message.text.trim())
  if (reply === undefined) return { isAdded: false, reason: 'Claude has not replied with text yet.' }

  return add($, reply.text)
}

export async function clearAll($: EngineInterface) {
  await update($, annotations, () => [])
  await update($, instruction, () => '')
  await update($, selected, () => null)
  await update($, editing, () => null)
  await update($, writing, () => null)
}

/** Sends the quotes as the person's own next prompt, then empties the composer. */
export async function send($: EngineInterface, extra = ''): Promise<string> {
  const overall = extra.trim() || (await read($, instruction))
  const text = buildFollowUp(await read($, annotations), overall)
  if (!text) return 'No quotes to send.'
  const result = await $.prompt.submit({ text, asUser: true })
  if (result.drop !== undefined) return `Not sent: ${result.drop}`
  await clearAll($)

  return 'Quotes sent to Claude.'
}

export function say($: EngineInterface, added: Added) {
  if (!added.isAdded) $.ui.toast(added.reason)
}

/** Everything the composer pane draws from; reading it subscribes the pane. */
export async function readComposer($: EngineInterface) {
  return {
    list: await read($, annotations),
    selected: await read($, selected),
    editingId: await read($, editing),
    openField: await read($, writing),
    overall: await read($, instruction),
  }
}

export async function changeQuotes($: EngineInterface, change: (list: QuoteAnnotation[]) => QuoteAnnotation[]) {
  await update($, annotations, change)
}

export async function setInstruction($: EngineInterface, value: string) {
  await update($, instruction, () => value)
}

/** Opens one quote (closing the one open before, and any field); `null` closes it. */
export async function openQuote($: EngineInterface, id: string | null) {
  await toggleField($, null)
  await update($, editing, () => null)
  await update($, selected, () => id)
}

export async function toggleEditing($: EngineInterface, id: string | null) {
  await update($, editing, current => (current === id ? null : id))
}

/** Opens a text field (a comment or the instruction), or closes it if open; `null` closes any. */
export async function toggleField($: EngineInterface, field: string | null) {
  const next = (await read($, writing)) === field ? null : field
  // Blank comments shift indices when dropped, so drop them only once no field is open.
  if (next === null) await update($, annotations, pruneComments)
  await update($, writing, () => next)
}

/** Adds an empty comment to a quote and opens its field. */
export async function startComment($: EngineInterface, id: string) {
  const pruned = pruneComments(await read($, annotations))
  const index = pruned.find(quote => quote.id === id)?.comments.length ?? 0
  await update($, annotations, () => appendComment(pruned, id))
  await update($, writing, () => commentField(id, index))
}

export async function deleteComment($: EngineInterface, id: string, index: number) {
  await update($, annotations, list => pruneComments(removeComment(list, id, index)))
  await update($, writing, () => null)
}

/** Scrolls the chat to the message a quote came from; answers why not when it cannot. */
export async function jumpToQuote($: EngineInterface, id: string): Promise<string | undefined> {
  const quote = (await read($, annotations)).find(one => one.id === id)
  if (quote === undefined) return undefined
  const requestId = quote.responseId ?? findReply(quote.selectedText)
  if (requestId === undefined) {
    return "Couldn't find this passage in Claude's replies shown in this session. Was it edited, or from an earlier session?"
  }
  try {
    const moved = await $.ui.scroll({ to: { requestId }, block: 'center' })

    return moved.deny === undefined ? undefined : `Couldn't go to the message: ${moved.deny}`
  } catch (error) {
    // A surface that scrolls no transcript rejects rather than denies.
    return `Couldn't go to the message: ${error instanceof Error ? error.message : String(error)}`
  }
}
