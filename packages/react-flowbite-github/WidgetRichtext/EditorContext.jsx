import React, { useState, useContext, createContext, useEffect } from 'react'
import reactToCSS from 'react-style-object-to-css'

export const context = createContext(null)
export const useEditor = () => useContext(context)

// TODO: need to figure out how to style absed on dark or light
const defaultStyles = {
  body: {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
  },
  blockquote: {
    paddingLeft: 4,
    marginBlockStart: 1,
    marginInlineStart: 1,
    borderLeft: '2px solid grey'
  },
  '.wrapper': {
    display: 'flex',
    borderRadius: 6
  },
  '.remove': {
    padding: 4,
    display: 'flex',
    marginLeft: 'auto',
    userSelect: 'none',
    cursor: 'pointer',
    alignItems: 'center',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: '#F9FAFB',
    border: '1px solid #D1D5DB'

  },
  '.remove:hover': {
    border: '1px solid #9CA3AF',
    backgroundColor: 'white'
  },
  '.remove svg': {
    margin: 4,
    justifyContent: 'middle'
  },
  '.display': {
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    userSelect: 'none',
    padding: '10px 20px',
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    textShadow: '0px 0px 0px #000',
    border: '1px solid #D1D5DB',
    backgroundColor: '#F9FAFB',
    borderRight: '0px solid transparent'
  },
  '.display:hover': {
    border: '1px solid #9CA3AF',
    backgroundColor: 'white'
  }
}

const cssString = (editorStyles = defaultStyles) => `<style>${Object.keys(editorStyles)
      .map(sel => `${sel} { ${reactToCSS(editorStyles[sel])} }`)
      .join('\n')}</style>`

const defaultComponents = {
  h1: ({ type, ...props }) => <h1 {...props} className='dark:text-red-500 text-6xl lg:text-7xl font-bold mb-6' />,
  h2: ({ type, ...props }) => <h2 {...props} className='text-5xl xl:text-6xl font-bold mb-6' />,
  h3: ({ type, ...props }) => <h3 {...props} className='text-[28px] mb-6 font-bold leading-[2.3rem]' />,
  h4: ({ type, ...props }) => <h4 {...props} className='whitespace-nowrap text-2xl mb-6 font-bold leading-[2.3rem]' />,
  h5: ({ type, ...props }) => <h5 {...props} className='text-2xl my-8 font-medium leading-[2rem]' />,
  p: ({ type, ...props }) => <p {...props} className='mb-6 text-2xl leading-[38px] font-light' />,
  blockquote: ({ type, ...props }) => <blockquote {...props} className='text-gc-darkgrey text-[43px] leading-[69px]  font-bold' />,
  li: ({ type, ...props }) => <li {...props} className='sm:mx-8 text-2xl font-light leading-[2.3rem] list-disc' />,
  ul: ({ type, ...props }) => <ul {...props} className='lg:p-4 lg:m-4' />
}

export function EditorProvider ({ children, editorStyles, value, onChange, name }) {
  const [editor, setEditor] = useState(null)
  const [markdownMode, setMarkdownMode] = useState(false)
  const [buttonStatus, setButtonStatus] = useState({})
  const [components, setComponents] = useState(defaultComponents)
  const [styleString, setStyleString] = useState(cssString(editorStyles))

  useEffect(() => {
    setStyleString(cssString(editorStyles))
  }, [editorStyles])
  return (
    <context.Provider value={{ name, value, onChange, components, setComponents, styleString, editor, setEditor, buttonStatus, setButtonStatus, markdownMode, setMarkdownMode }}>
      {children}
    </context.Provider>
  )
}
