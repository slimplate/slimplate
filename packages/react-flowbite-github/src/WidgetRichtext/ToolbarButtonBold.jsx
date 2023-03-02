import ToolbarButton from './ToolbarButton'

export default function ToolbarButtonBold ({ children, ...props }) {
  return (
    <ToolbarButton name='bold' {...props}>
      {children}
    </ToolbarButton>
  )
}
