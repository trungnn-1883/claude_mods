// The Quotes pane: one line per quote, only the open one showing its comments and actions.
import type { EngineInterface, RenderInput } from 'claude-code'

import {
  INSTRUCTION_FIELD,
  addLastReply,
  changeQuotes,
  clearAll,
  commentField,
  deleteComment,
  openQuote,
  readComposer,
  say,
  send,
  setInstruction,
  startComment,
  toggleEditing,
  toggleField,
} from './quote-actions'
import { moveQuote, removeQuote, setComment, setQuoteText, summarize } from './quote-annotations'

const MENU = [
  { value: 'menu', label: '⋯' },
  { value: 'edit', label: 'Edit quote' },
  { value: 'up', label: 'Move up' },
  { value: 'down', label: 'Move down' },
  { value: 'remove', label: 'Remove' },
]

async function act($: EngineInterface, id: string, action: string) {
  if (action === 'edit') return toggleEditing($, id)
  if (action === 'up' || action === 'down') return changeQuotes($, l => moveQuote(l, id, action === 'up' ? -1 : 1))
  if (action === 'remove') {
    await toggleField($, null)
    await changeQuotes($, l => removeQuote(l, id))
  }
}

export async function drawComposer($: EngineInterface, e: RenderInput<'Pane'>) {
  const ui = $.ui.resolve(e)
  const { Box, Button, Text } = ui
  const { list, selected, editingId, openField, overall } = await readComposer($)
  // Mobile has no text field or picker: its table still names them but draws them empty.
  const Input = e.surface !== 'mobile' && 'Input' in ui ? ui.Input : undefined
  const Select = e.surface !== 'mobile' && 'Select' in ui ? ui.Select : undefined
  const width = Math.max(24, e.props.bodyColumns - 2)
  const isWritingInstruction = Input !== undefined && openField === INSTRUCTION_FIELD

  return (
    <Box flexDirection="column" gap={1} paddingX={1}>
      <Box justifyContent="space-between">
        <Text bold>{list.length ? `Quotes · ${list.length}` : 'Quotes'}</Text>
        <Button key="add-last" plain label="+ Last reply" onPress={async () => say($, await addLastReply($))} />
      </Box>
      {list.length === 0 && <Text dimColor>Select text in a reply, then type /quote.</Text>}
      {list.map(quote => {
        const isOpen = quote.id === selected
        const isEditing = isOpen && Input !== undefined && editingId === quote.id
        const written = quote.comments.filter(one => one.trim()).length
        const isWritingHere = Input !== undefined && openField?.startsWith(`comment:${quote.id}:`) === true
        const header = `${isOpen ? '▾' : '▸'} ${quote.order}  “${summarize(quote.selectedText, width - 12)}”`

        return (
          <Box key={`quote:${quote.id}`} flexDirection="column">
            <Button key={`open:${quote.id}`} plain onPress={() => openQuote($, isOpen ? null : quote.id)}>
              {header} <Text dimColor>{`💬 ${written}`}</Text>
            </Button>
            {isOpen && (
              <Box flexDirection="column" paddingLeft={3} marginTop={1} gap={1}>
                {isEditing ? (
                  <Input
                    key={`text:${quote.id}`}
                    rows={3}
                    value={quote.selectedText}
                    submitLabel="save"
                    autoFocus
                    onInput={value => changeQuotes($, l => setQuoteText(l, quote.id, value))}
                    onSubmit={async value => {
                      await changeQuotes($, l => setQuoteText(l, quote.id, value))
                      await toggleEditing($, quote.id)
                    }}
                  />
                ) : (
                  <Text italic dimColor>“{quote.selectedText}”</Text>
                )}
                <Box flexDirection="column">
                  {written === 0 && !isWritingHere && <Text dimColor>No comments yet</Text>}
                  {quote.comments.map((comment, index) => {
                    const field = commentField(quote.id, index)
                    const save = (value: string) => changeQuotes($, l => setComment(l, quote.id, index, value))
                    if (Input !== undefined && openField === field) {
                      return (
                        <Box key={`row:${field}`} flexDirection="column">
                          <Input
                            key={field}
                            placeholder="Your comment. Enter saves"
                            rows={2}
                            value={comment}
                            submitLabel="save"
                            autoFocus
                            onInput={save}
                            onSubmit={async value => {
                              await save(value)
                              await toggleField($, null)
                            }}
                          />
                          <Button key={`edit-comment:${quote.id}:${index}`} plain label="Save" onPress={() => toggleField($, null)} />
                        </Box>
                      )
                    }
                    // A blank comment is a field left open and then abandoned: nothing to show.
                    if (!comment.trim()) return false
                    if (Input === undefined) return <Text key={`row:${field}`}>• {comment}</Text>

                    return (
                      <Box key={`row:${field}`} justifyContent="space-between">
                        <Button key={`edit-comment:${quote.id}:${index}`} plain onPress={() => toggleField($, field)}>
                          {`• ${comment}`}
                        </Button>
                        <Button key={`remove-comment:${quote.id}:${index}`} plain label="✕" onPress={() => deleteComment($, quote.id, index)} />
                      </Box>
                    )
                  })}
                </Box>
                <Box justifyContent="space-between">
                  {Input !== undefined && (
                    <Button key={`note:${quote.id}`} plain label="+ Add comment" onPress={() => startComment($, quote.id)} />
                  )}
                  {Select !== undefined ? (
                    <Select key={`menu:${quote.id}`} value="menu" options={MENU} onSelect={value => act($, quote.id, value)} />
                  ) : (
                    <Box gap={2}>
                      <Button key={`up:${quote.id}`} plain label="↑" onPress={() => act($, quote.id, 'up')} />
                      <Button key={`down:${quote.id}`} plain label="↓" onPress={() => act($, quote.id, 'down')} />
                      <Button key={`remove:${quote.id}`} plain label="✕" onPress={() => act($, quote.id, 'remove')} />
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )
      })}
      <Text dimColor>{'─'.repeat(width)}</Text>
      {isWritingInstruction ? (
        <Input
          key={INSTRUCTION_FIELD}
          placeholder="Applies to every quote. Enter saves"
          value={overall}
          submitLabel="save"
          autoFocus
          onInput={value => setInstruction($, value)}
          onSubmit={async value => {
            await setInstruction($, value)
            await toggleField($, null)
          }}
        />
      ) : Input === undefined ? (
        overall.trim() && <Text>Instruction: {overall}</Text>
      ) : (
        <Button key="note:instruction" plain onPress={() => toggleField($, INSTRUCTION_FIELD)}>
          {overall.trim() ? `Instruction: ${overall}` : <Text dimColor>+ Overall instruction (optional)</Text>}
        </Button>
      )}
      <Box gap={2}>
        <Button key="send" variant="primary" label={`Send to Claude (${list.length})`} onPress={async () => $.ui.toast(await send($))} />
        {list.length > 0 && <Button key="clear" plain label="Clear all" onPress={() => clearAll($)} />}
      </Box>
    </Box>
  )
}
