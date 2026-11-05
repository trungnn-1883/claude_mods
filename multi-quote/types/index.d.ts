/** One quoted passage of a Claude reply and the person's comments on it. */
export type QuoteAnnotation = {
  id: string
  sessionId?: string
  /** The transcript row the selection lay in, when the engine reported one. */
  responseId?: string
  selectedText: string
  /** The person's comments on this quote, in the order written. */
  comments: string[]
  /** 1-based position in the composer, kept in step with the list's order. */
  order: number
}

declare module 'claude-code' {
  interface PluginState {
    'multi-quote': {
      annotations: Shaped<QuoteAnnotation[]>
      instruction: string
      /** Id of the one quote drawn open, with its comments and actions. */
      selected: string | null
      /** Id of the quote whose text is being edited, if any. */
      editing: string | null
      /** Which text field is open: `comment:<id>:<index>`, `instruction`, or none. */
      writing: string | null
    }
  }
}
