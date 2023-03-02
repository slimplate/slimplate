import ToolbarButton from './ToolbarButton'

export default function ToolbarButtonOrderedList ({ children, ...props }) {
  return (
    <ToolbarButton name='insertOrderedList' {...props}>
      {children}
    </ToolbarButton>
  )
}
