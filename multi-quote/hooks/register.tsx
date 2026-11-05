import type { Register } from 'claude-code'

import { markOwnCommandRun, trimRecord } from './command-record-trim'
import { drawComposer } from './composer-pane'
import { PANE, TITLE, add, addLastReply, addSelection, clearAll, send } from './quote-actions'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'quote', description: 'Add the selected text (or the given text) as a quote', argumentHint: '[text]' })
    await $.command.register({ name: 'quote-last', description: "Add Claude's latest reply as a quote, to trim with Edit" })
    await $.command.register({ name: 'quotes', description: 'Open the quote composer' })
    await $.command.register({ name: 'quote-send', description: 'Send every quote and comment to Claude', argumentHint: '[overall instruction]' })
    await $.command.register({ name: 'quote-clear', description: 'Remove every quote' })

    return next(e)
  })

  on('command.run', { command: 'quote' }, async ($, e) => {
    markOwnCommandRun()
    const added = e.args.trim() ? await add($, e.args) : await addSelection($)

    return { text: added.isAdded ? 'Quote added.' : added.reason }
  })

  on('command.run', { command: 'quote-last' }, async $ => {
    markOwnCommandRun()
    const added = await addLastReply($)

    return { text: added.isAdded ? 'Latest reply added as a quote.' : added.reason }
  })

  on('command.run', { command: 'quotes' }, async $ => {
    markOwnCommandRun()
    const opened = await $.ui.open({ id: PANE, title: TITLE, focus: true })

    return { text: opened.isPlaced ? 'Quote composer opened.' : `Composer not shown: ${opened.reason}` }
  })

  on('command.run', { command: 'quote-send' }, async ($, e) => {
    markOwnCommandRun()

    return { text: await send($, e.args) }
  })

  on('command.run', { command: 'quote-clear' }, async $ => {
    markOwnCommandRun()
    await clearAll($)

    return { text: 'Quotes cleared.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, ($, e) => drawComposer($, e))

  // Shrink the chat's record of the mod's own commands; every other row passes untouched.
  on('session.append', ($, e, next) => {
    if (e.message.type !== 'user') return next(e)
    const text = e.message.content.map(block => (typeof block.text === 'string' ? block.text : '')).join('')
    const short = trimRecord(text)
    if (short === undefined) return next(e)

    return next({ ...e, message: { ...e.message, content: short ? [{ type: 'text', text: short }] : [] } })
  })
}
