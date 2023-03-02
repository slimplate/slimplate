import { useEditor } from './EditorContext'
import ToolbarButton from './ToolbarButton'

export default function ToolbarButtonCode ({ children, ...props }) {
  const { editor } = useEditor()

  function handleCode () {
    const selection = editor.getSelection()
    const range = selection.getRangeAt(0)
    const closestPre = range.commonAncestorContainer.parentNode.closest('pre')

    if (closestPre) {
      const closestCode = range.commonAncestorContainer.parentNode.closest('code')
      const c = editor.createTextNode(closestCode.innerHTML.toString())
      closestPre.parentNode.replaceChild(c, closestPre)
    } else {
      const preEl = editor.createElement('pre')
      const codeEl = editor.createElement('code')
      codeEl.innerText = selection.toString()
      preEl.appendChild(codeEl)
      selection.deleteFromDocument()
      selection.getRangeAt(0).insertNode(preEl)
    }
  }

  return (
    <ToolbarButton
      name='code'
      onClick={handleCode}
      {...props}
    >
      {children}
    </ToolbarButton>
  )
}
