import ToolbarButton from './ToolbarButton'

export default function ToolbarButtonItalic ({ children, ...props }) {
  return (
    <ToolbarButton name='italic' {...props}>
      {children}
    </ToolbarButton>
  )
}
