import { useEditor } from './EditorContext'
import ToolbarButton from './ToolbarButton'

export default function ToolbarButtonQuote ({ children, props }) {
  const { editor } = useEditor()

  function handleQuote () {
    const selection = editor.getSelection()
    const range = selection.getRangeAt(0)
    const r = range.commonAncestorContainer.parentNode.closest('blockquote')
    if (r) {
      r.outerHTML = r.innerHTML
    } else {
      const quote = document.createElement('blockquote')
      quote.innerText = selection.toString()
      selection.deleteFromDocument()
      selection.getRangeAt(0).insertNode(quote)
    }
  }

  return (
    <ToolbarButton
      name='quote'
      onClick={handleQuote}
      {...props}
    >
      {children}
    </ToolbarButton>
  )
}
