// Claude Code records every slash command in the chat Claude reads: a caveat row, the
// command's line and its output, ~140 tokens a run. For the mod's own commands Claude needs
// none of it (the quotes reach Claude when sent), so these rows shrink to the command's name.

const OWN_COMMAND = /^<command-name>\/(quote|quotes|quote-last|quote-send|quote-clear)<\/command-name>/
const CAVEAT = '<local-command-caveat>'

// The caveat names no command, so it is only known to be ours when one of our commands just ran.
let isOwnCommandRunning = false

export const markOwnCommandRun = () => {
  isOwnCommandRunning = true
}

/** What a recorded row's text shrinks to: `undefined` keeps it, `''` empties it. */
export const trimRecord = (text: string): string | undefined => {
  if (text.startsWith(CAVEAT)) return isOwnCommandRunning ? '' : undefined
  if (!text.startsWith('<command-name>')) return undefined
  isOwnCommandRunning = false

  return OWN_COMMAND.exec(text)?.[1]?.replace(/^/, '/')
}
