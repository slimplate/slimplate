import ToolbarButton from './ToolbarButton'

export default function ToolbarButtonUnorderedList ({ children, ...props }) {
  return (
    <ToolbarButton name='insertUnorderedList' {...props}>
      {children}
    </ToolbarButton>
  )
}
