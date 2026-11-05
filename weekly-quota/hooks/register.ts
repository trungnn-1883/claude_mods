import type { Register, SessionRateLimit } from 'claude-code'

import { CAT_TICK_MS, catText, createCat } from './cat'

const part = (label: string, w: SessionRateLimit | undefined, now: number) => {
  if (!w) return `${label}: --`
  const left = Math.max(0, Math.round((100 - w.percentUsed) * 10) / 10)
  const hours = w.resetsAt
    ? `, reset in ${(Math.max(0, Date.parse(w.resetsAt) - now) / 3_600_000).toFixed(1)}h`
    : ''
  return `${label}: ${left}% còn lại${hours}`
}

const quotaText = (limits: SessionRateLimit[], now: number) => {
  const week = limits.find(l => l.kind === 'seven_day')
  const hour = limits.find(l => l.kind === 'five_hour')
  if (!week && !hour) return ''
  return `${part('Tuần', week, now)} │ ${part('Giờ', hour, now)}`
}

const state = { quota: '', isCatOn: true, cat: '' }

const draw = ($: any) => {
  if (!state.quota) return $.ui.status(undefined)
  $.ui.status(state.isCatOn && state.cat ? `${state.quota}   ${state.cat}` : state.quota)
}

const setQuota = async ($: any, limits: SessionRateLimit[]) => {
  state.quota = quotaText(limits, await $.clock.now())
  draw($)
}

export const register: Register = on => {
  const step = createCat()

  on('session.start', async ($, e, next) => {
    state.isCatOn = (await $.store.get('isCatOn')) !== false
    await $.command.register({ name: 'cat', description: 'Turn the quota cat animation on or off' })
    await setQuota($, (await $.session.usage()).rateLimits)
    $.clock.every(CAT_TICK_MS, () => {
      if (!state.isCatOn) return
      state.cat = catText(step())
      draw($)
    })
    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await setQuota($, e.rateLimits)
    return next(e)
  })

  on('command.run', { command: 'cat' }, async $ => {
    state.isCatOn = !state.isCatOn
    await $.store.set('isCatOn', state.isCatOn)
    draw($)
    return { text: state.isCatOn ? 'Mèo chạy lại rồi.' : 'Mèo đã nghỉ.' }
  })
}
