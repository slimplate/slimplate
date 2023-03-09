import { unified } from 'unified'
import remarkHtml from 'remark-html'
import remarkParse from 'remark-parse'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import remarkMdx from 'remark-mdx'
import { visit } from 'unist-util-visit'

/* global crypto */

function uuidv4 () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

export function outputComponentPlaceHolder ({ type, name, props = {} }) {
  const propsString = escape(JSON.stringify(props))
  const id = uuidv4()
  return `
  <div
  id="${id}"
  contenteditable="false"
  data-type="${type}"
  data-props="${propsString}"
  class="wrapper"
>
  <button class='display' contenteditable="false" onclick="window.parent.postMessage({ action: 'edit', id: '${id}',  type: '${type}', name: '${name}' })">Edit ${type}</button>
  <button class='remove' contenteditable="false" onclick="window.parent.postMessage({ action: 'delete', id: '${id}',  type: '${type}', name: '${name}' })">
    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M4 7l16 0" />
      <path d="M10 11l0 6" />
      <path d="M14 11l0 6" />
      <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
      <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
    </svg>
  </button>
</div>
  `
}

// turn <Element p1=1 /> into <button data-props='{p1: 1}'>Element</button>
// must load remarkMdx firs
// TODO: I dunno if this id/counter system works, just ID might be better
export function remarkSlimplate ({ name = 'YOU_SHOULD_SET_THIS' }) {
  return tree => visit(tree, (node) => {
    if (node.type === 'mdxJsxFlowElement') {
      node.type = 'html'

      const props = {}
      // TODO: handle children?

      for (const prop of node.attributes) {
        if (prop.value?.type === 'mdxJsxAttributeValueExpression') {
          props[prop.name] = JSON.parse(prop.value.value)
        } else {
          props[prop.name] = prop.value
        }
      }

      node.value = outputComponentPlaceHolder({ name, type: node.name, props })
    }
  })
}

// turn <button data-props='{p1: 1}'>Element</button> into <Element p1=1 />
function slimplatePatchButton (state, node) {
  node.type = 'html'

  const p = JSON.parse(unescape(node?.properties?.dataProps || '%7B%7D'))
  const tag = node?.properties?.dataType
  delete node.children
  const props = Object.keys(p).map(k => `${k}=${typeof p[k] === 'string' ? JSON.stringify(p[k]).replace(/"/g, "'") : `{${JSON.stringify(p[k])}}`}`)
  node.value = `<${tag} ${props.join(' ')} />`
  return node
}

// Turns MDX (from file) to HTML (for editor)
export const mdx2html = async (input, options = {}) => {
  const out = await unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkSlimplate, options)
    .use(remarkHtml, { sanitize: false })
    .process(input)
    .then(({ value }) => value)
  // console.log('mdx2html', out)
  return out
}

// Turns HTML (from editor) to MDX (for file)
export const html2mdx = async (input, options = {}) => {
  const out = await unified()
    .use(rehypeParse)
    .use(rehypeRemark, { handlers: { div: slimplatePatchButton } })
    .use(remarkStringify)
    .process(input)
    .then(({ value }) => value)
  // console.log('html2mdx', out)
  return out
}
