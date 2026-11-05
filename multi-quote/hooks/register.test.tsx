import { expect, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

import { buildFollowUp, moveQuote } from './quote-annotations'

const PANE = {
  plugin: 'multi-quote',
  component: 'Pane',
  requestId: 'quote-composer',
  props: {
    title: 'Quotes',
    isFocused: true,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

// Stands in for the engine beneath the plugin; returns what was submitted.
const engine = (on: On, selection?: { text: string; requestId?: string }, toasts: string[] = []) => {
  const submitted: string[] = []
  on('command.register', (_, e) => ({ value: { command: e.name } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.toast', (_, e) => {
    toasts.push(JSON.stringify(e))
    return { value: undefined }
  })
  on('ui.selection', () => ({ value: selection }))
  on('session.id', () => ({ value: 'session-1' }))
  on('session.messages', () => ({
    value: [
      { role: 'user', text: 'hi', toolUses: [] },
      { role: 'assistant', text: 'Retry failed requests automatically.', toolUses: [] },
    ],
  }))
  on('prompt.submit', (_, e) => {
    submitted.push(e.text)
    return { text: e.text }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  return submitted
}

const start = ($: Engine) => $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

const run = ($: Engine, command: string, args = '') =>
  $.command.run({
    command,
    args,
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 160 },
  })

type Mounted = Awaited<ReturnType<Engine['ui']['mount']>>

// Quote ids in the order drawn: the quote switcher's options, or on mobile the open buttons.
const quoteIds = async (ui: Pick<Mounted, 'find' | 'findAll'>) => {
  const pick = await ui.find({ key: 'pick' })
  if (pick) return (pick.props.options as { value: string }[]).map(option => option.value)

  return (await ui.findAll({ type: 'Button' }))
    .map(button => button.key ?? '')
    .filter(key => key.startsWith('open:'))
    .map(key => key.slice('open:'.length))
}

test('the follow-up keeps each quote with its own comments and the overall instruction', () => {
  const text = buildFollowUp(
    [
      { id: 'a', selectedText: 'Use a singleton.', comments: ['We need several connections.'], order: 1 },
      { id: 'b', selectedText: 'Line one\nLine two', comments: ['', '  '], order: 2 },
      { id: 'c', selectedText: 'Retry.', comments: ['Add backoff.', '', 'Cap it at 5 tries.'], order: 3 },
    ],
    'Address every comment.',
  )
  expect(text).toBe(
    'Please review the following feedback on your earlier replies.\n\n' +
      'Quote 1:\n> Use a singleton.\n\nComment:\nWe need several connections.\n\n' +
      'Quote 2:\n> Line one\n> Line two\n\nComment:\n(no comment)\n\n' +
      'Quote 3:\n> Retry.\n\nComments:\n1. Add backoff.\n2. Cap it at 5 tries.\n\n' +
      'Overall instruction:\nAddress every comment.',
  )
  expect(buildFollowUp([], 'anything')).toBe('')
})

test('moving a quote renumbers the list and stops at either end', () => {
  const list = [
    { id: 'a', selectedText: 'A', comments: [], order: 1 },
    { id: 'b', selectedText: 'B', comments: [], order: 2 },
  ]
  const moved = moveQuote(list, 'b', -1)
  expect(moved.map(q => [q.id, q.order])).toEqual([['b', 1], ['a', 2]])
  expect(moveQuote(list, 'a', -1)).toBe(list)
  expect(moveQuote(list, 'b', 1)).toBe(list)
})

test('/quote adds the transcript selection once, trimmed', async ($, on) => {
  engine(on, { text: '  Use middleware.  ', requestId: 'msg-7' })
  await start($)

  expect((await run($, 'quote')).text).toBe('Quote added.')
  // The same selection pressed twice is not added twice.
  expect((await run($, 'quote')).text).toBe('That passage is already the latest quote.')

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await quoteIds(ui)).toHaveLength(1)
  expect(await ui.find({ type: 'Text', text: '“Use middleware.”' })).toBeDefined()
  await ui.unmount()
})

test('/quote with nothing selected says how to get a quote instead', async ($, on) => {
  engine(on)
  await start($)

  expect((await run($, 'quote')).text).toMatch(/^Nothing selected/)
  expect((await run($, 'quote', 'typed passage')).text).toBe('Quote added.')
  expect((await run($, 'quote-last')).text).toBe('Latest reply added as a quote.')
})

test('the composer opens one quote at a time and edits, reorders, removes and sends', async ($, on) => {
  const submitted = engine(on)
  await start($)
  for (const surface of ['terminal', 'desktop', 'vscode'] as const) {
    await run($, 'quote', 'First passage')
    await run($, 'quote', 'Second passage')
    await run($, 'quote', 'Third passage')

    const ui = await $.ui.mount({ ...PANE, surface })
    const [first, second, third] = await quoteIds(ui)
    expect(await quoteIds(ui)).toHaveLength(3)

    // The newest quote is open, with its first comment field ready; Enter saves it.
    await ui.input({ key: `comment:${third}:0`, text: 'Add backoff.' })
    expect(await ui.find({ type: 'Input', key: `comment:${third}:0` })).toBeUndefined()
    expect((await ui.find({ key: `edit-comment:${third}:0` }))?.text).toBe('• Add backoff.')

    // Add comment opens another field on the same quote; a third is added then deleted.
    await ui.press({ key: `note:${third}` })
    await ui.input({ key: `comment:${third}:1`, text: 'And jitter.' })
    await ui.press({ key: `note:${third}` })
    await ui.input({ key: `comment:${third}:2`, text: 'Drop me.' })
    await ui.press({ key: `remove-comment:${third}:2` })
    expect(await ui.find({ type: 'Button', text: /Drop me/ })).toBeUndefined()

    // Only the open quote shows its comments and actions; pressing it again closes it.
    expect(await ui.find({ key: `note:${first}` })).toBeUndefined()
    await ui.press({ key: `open:${first}` })
    expect(await ui.find({ key: `note:${first}` })).toBeDefined()
    expect(await ui.find({ key: `note:${third}` })).toBeUndefined()

    // Typing alone keeps the text; Save shows it; pressing the comment edits it again.
    await ui.press({ key: `note:${first}` })
    await ui.input({ key: `comment:${first}:0`, text: 'Not a singleton', kind: 'change' })
    await ui.press({ key: `edit-comment:${first}:0` })
    expect((await ui.find({ key: `edit-comment:${first}:0` }))?.text).toBe('• Not a singleton')
    await ui.press({ key: `edit-comment:${first}:0` })
    await ui.input({ key: `comment:${first}:0`, text: 'Not a singleton.' })

    // The ⋯ menu removes and moves the open quote.
    await ui.press({ key: `open:${second}` })
    await ui.select({ key: `menu:${second}`, value: 'remove' })
    await ui.press({ key: `open:${third}` })
    await ui.select({ key: `menu:${third}`, value: 'up' })
    expect(await quoteIds(ui)).toEqual([third, first])
    await ui.press({ key: `open:${third}` })
    expect(await ui.find({ key: `menu:${third}` })).toBeUndefined()

    await ui.press({ key: 'note:instruction' })
    await ui.input({ key: 'instruction', text: 'Fix them all.' })
    expect((await ui.find({ key: 'note:instruction' }))?.text).toMatch(/Fix them all\./)
    expect((await ui.find({ key: 'send' }))?.text).toMatch(/\(2\)/)
    await ui.press({ key: 'send' })

    expect(submitted.at(-1)).toBe(
      'Please review the following feedback on your earlier replies.\n\n' +
        'Quote 1:\n> Third passage\n\nComments:\n1. Add backoff.\n2. And jitter.\n\n' +
        'Quote 2:\n> First passage\n\nComment:\nNot a singleton.\n\n' +
        'Overall instruction:\nFix them all.',
    )
    expect(await quoteIds(ui)).toHaveLength(0)
    await ui.unmount()
  }
})

test('editing a quote from the menu replaces its text', async ($, on) => {
  engine(on)
  await start($)
  await run($, 'quote', 'A long reply with extra words')
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  const [id] = await quoteIds(ui)
  await ui.select({ key: `menu:${id}`, value: 'edit' })
  await ui.input({ key: `text:${id}`, text: 'extra words' })

  expect(await ui.find({ type: 'Text', text: '“extra words”' })).toBeDefined()
  await ui.unmount()
})

test('mobile, which has no text fields or menus, still lists, moves and sends quotes', async ($, on) => {
  const submitted = engine(on)
  await start($)
  await run($, 'quote', 'Passage one')
  await run($, 'quote', 'Passage two')

  const ui = await $.ui.mount({ ...PANE, surface: 'mobile' })
  const [one, two] = await quoteIds(ui)
  expect(await ui.find({ type: 'Text', text: /No comments/ })).toBeDefined()
  await ui.press({ key: `up:${two}` })
  expect(await quoteIds(ui)).toEqual([two, one])
  await ui.press({ key: 'send' })
  expect(submitted).toHaveLength(1)
  await ui.unmount()
})

test('the pane has no Add selection button; /quote still says how to quote, without angle brackets', async ($, on) => {
  engine(on)
  await start($)

  const ui = await $.ui.mount({ ...PANE, surface: 'vscode' })
  expect(await ui.find({ type: 'Button', key: 'add' })).toBeUndefined()
  expect(await ui.find({ type: 'Button', key: 'add-last' })).toBeDefined()
  expect((await run($, 'quote')).text).not.toMatch(/[<>]/)
  await ui.unmount()
})
