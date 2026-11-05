export type CatView = {
  x: number
  tail: string
  face: string
  extra: string
  extraColor: string
  hasWall: boolean
  action: string
  frame: number
  dir: number
}

const WIDTH = 34
const TICK_MS = 350

type Action = 'run' | 'sleep' | 'yarn' | 'scratch' | 'lick'

// [min, max] seconds each action lasts
const SECONDS: Record<Action, [number, number]> = {
  run: [8, 12],
  sleep: [8, 12],
  yarn: [8, 12],
  scratch: [8, 12],
  lick: [8, 12],
}
const ACTIONS = Object.keys(SECONDS) as Action[]

const between = (min: number, max: number) => min + Math.random() * (max - min)

// Steps the cat once per tick; keeps its own position, action and timer.
export const createCat = () => {
  let action: Action = 'run'
  let x = 0
  let dir = 1
  let frame = 0
  let ticksLeft = 0
  let isWalkingToWall = false

  const start = (next: Action) => {
    action = next
    const [min, max] = SECONDS[next]
    ticksLeft = Math.round((between(min, max) * 1000) / TICK_MS)
    isWalkingToWall = next === 'scratch'
    if (isWalkingToWall) dir = 1
    else if (next === 'run') dir = Math.random() < 0.5 ? 1 : -1
  }

  const pickNext = () => {
    const others = ACTIONS.filter(a => a !== action)
    start(others[Math.floor(Math.random() * others.length)] as Action)
  }

  start('run')

  const step = (): Omit<CatView, 'action' | 'frame' | 'dir'> => {
    frame += 1
    const alt = frame % 2 === 0
    const move = () => {
      x += dir
      if (x <= 0 || x >= WIDTH - 7) dir = -dir
      x = Math.max(0, Math.min(WIDTH - 7, x))
    }

    if (isWalkingToWall) {
      x = Math.min(WIDTH - 7, x + 2)
      if (x >= WIDTH - 7) isWalkingToWall = false
      return { x, tail: '~', face: '=^.^=', extra: '', extraColor: '', hasWall: true }
    }

    ticksLeft -= 1
    if (ticksLeft <= 0) pickNext()

    const base = { x, extra: '', extraColor: '#FFFFFF', hasWall: false }
    switch (action) {
      case 'run':
        move()
        return {
          ...base,
          x,
          tail: dir === 1 ? (alt ? '~' : '-') : '',
          face: alt ? '=^.^=' : '=^o^=',
          extra: dir === -1 ? (alt ? '~' : '-') : '',
        }
      case 'sleep':
        return {
          ...base,
          tail: '_',
          face: '=-.-=',
          extra: [' z', ' zz', ' zzZ', ' zzZZ'][Math.floor(frame / 3) % 4] ?? '',
        }
      case 'yarn': {
        const ball = ['  @', ' @', '@', ' @'][Math.floor(frame / 2) % 4]
        return { ...base, tail: '~', face: alt ? '=^.^=' : '=^o^=', extra: `${ball}~~`, extraColor: '#E5484D' }
      }
      case 'scratch':
        return {
          ...base,
          x: WIDTH - 7,
          tail: '~',
          face: '=>.<=',
          extra: alt ? '/' : '\\',
          hasWall: true,
        }
      case 'lick':
        return {
          ...base,
          tail: '~',
          face: alt ? '=^-^=' : '=^.^=',
          extra: alt ? 'c' : ' c',
        }
    }
  }

  return (): CatView => {
    const v = step()
    return { ...v, action: isWalkingToWall ? 'walk' : action, frame, dir }
  }
}

export const CAT_TICK_MS = TICK_MS
export const CAT_WIDTH = WIDTH

const NBSP = ' '

// The cat as one line of text, placed `x` columns in, with the wall at the end.
export const catText = (v: CatView): string => {
  const cat = `${v.tail}${v.face}${v.extra}`
  const wall = v.hasWall ? `${NBSP.repeat(Math.max(0, WIDTH - v.x - cat.length))}|` : ''
  return `${NBSP.repeat(v.x)}${cat}${wall}`
}
