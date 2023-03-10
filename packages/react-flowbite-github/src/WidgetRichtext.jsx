import { useState, useEffect } from 'react'
import Toolbar from './WidgetRichtext/Toolbar'
import EditorView from './WidgetRichtext/EditorView'
import FormEditButton from './WidgetRichtext/FormEditButton'
import { EditorProvider } from './WidgetRichtext/EditorContext'
import { Link, Album, LetterH, Quote, Italic, Bold, List, ListNumbers, Plus } from 'tabler-icons-react'

import {
  ToolbarButtonCode,
  ToolbarButtonBold,
  ToolbarButtonLink,
  ToolbarButtonQuote,
  ToolbarButtonImage,
  ToolbarButtonItalic,
  ToolbarButtonHeader,
  ToolbarButtonDivider,
  ToolbarButtonComponent,
  ToolbarButtonOrderedList,
  ToolbarButtonUnorderedList
} from './WidgetRichtext/components'

const CodeSVG = () => (
  <svg
    aria-hidden='true'
    fill='currentColor'
    viewBox='0 0 20 20'
    className='w-[16px]'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z'
    />
  </svg>
)

export default function WidgetRichText ({ editorStyles, value, onChange, name, label }) {
  const [val, setVal] = useState(value)

  useEffect(() => {
    onChange(val)
  }, [val])

  return (
    <div>
      <label htmlFor={name} className='block mb-2 text-sm font-medium text-gray-900 dark:text-white flex'>{label}</label>
      <EditorProvider name={name} editorStyles={editorStyles} value={val} onChange={setVal}>
        <Toolbar addMarkdownButton>

          <ToolbarButtonBold>
            <Bold size='16' />
          </ToolbarButtonBold>

          <ToolbarButtonItalic>
            <Italic size='16' />
          </ToolbarButtonItalic>

          <ToolbarButtonHeader>
            <LetterH size='16' />
          </ToolbarButtonHeader>

          <ToolbarButtonQuote>
            <Quote size='16' />
          </ToolbarButtonQuote>

          <ToolbarButtonLink>
            <Link size='16' />
          </ToolbarButtonLink>

          <ToolbarButtonCode>
            <CodeSVG />
          </ToolbarButtonCode>

          <ToolbarButtonDivider />

          <ToolbarButtonUnorderedList>
            <List size='16' />
          </ToolbarButtonUnorderedList>

          <ToolbarButtonOrderedList>
            <ListNumbers size='16' />
          </ToolbarButtonOrderedList>

          <ToolbarButtonImage>
            <Album size='16' />
          </ToolbarButtonImage>

        </Toolbar>
        <EditorView />
      </EditorProvider>
    </div>
  )
}
