// form for editing/adding new content
import { useSlimplate, useGit } from './react-github.jsx'
import { Button } from 'flowbite-react'
import { useEffect, useState } from 'react'
import YAML from 'yaml'
import { tt } from '@slimplate/utils'

const dirname = (f) => f.split('/').slice(0, -1).join('/')

function WidgetUndefined (props) {
  return <pre>{JSON.stringify(props, null, 2)}</pre>
}

// do all the git stuffs
async function doGit (git, output, filename) {
  await git.mkdirp(dirname(filename))
  await git.write(filename, output)
  await git.add(filename)
  await git.commit('edited "' + filename + '" article.')
}

// turn article back into markdown
function doMarkdown (collection, article, filename) {
  const frontmatter = { ...collection.content[filename] }
  delete frontmatter.filename
  delete frontmatter.raw

  for (const field of collection.fields) {
    frontmatter[field.name] = article[field.name]
  }

  let output = ''
  if (collection.contentField) {
    output += frontmatter[collection.contentField]
    delete frontmatter[collection.contentField]
  }

  output = '---\n' + YAML.stringify(frontmatter) + '---\n' + output

  return output
}

export default function AdminEdit ({ projectName, collectionName, filename, onSubmit = console.log, onChange = () => {} }) {
  const { projects, setProjects, widgets } = useSlimplate()
  const git = useGit(projectName)

  const [article, setArticle] = useState({})
  const [collection, setCollection] = useState({})
  const [project, setProject] = useState({})
  const [isNew, setIsNew] = useState(true)

  useEffect(() => {
    if (!projectName || !collectionName || !filename) {
      return
    }
    let a = {}
    const isNewT = filename === true

    setIsNew(isNewT)
    setProject(projects[projectName])
    setCollection(projects[projectName].collections[collectionName])
    if (!isNewT) {
      a = { ...projects[projectName].collections[collectionName].content[filename] }
    } else {
      for (const field of projects[projectName].collections[collectionName].fields) {
        a[field.name] = tt(field.defaultValue || '', { collection: projects[projectName].collections[collectionName], ...a, project: projects[projectName] })
      }
    }

    setArticle(a || {})
  }, [projectName, collectionName, filename])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const p = { ...projects }

    // filename setting
    article.filename = filename
    if (typeof filename !== 'string') {
      article.filename = tt(p[projectName].collections[collectionName].filename, { collection, ...article })
    }

    p[projectName].collections[collectionName].content[article.filename] = article

    //  update memory
    setProjects(p)

    // parse article into markdown
    const output = doMarkdown(collection, article, filename)
    article.raw = output

    // commit new file to git
    const newArticle = await doGit(git, output, article.filename)
    onSubmit(newArticle)
  }

  const handleChange = field => value => {
    setArticle({ ...article, [field.name]: value })
  }

  return (
    <div className='p-8 border dark:bg-gray-800 rounded-lg'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        {Object.values(collection?.fields || []).map(field => {
          const t = field.type || 'string'
          if (widgets[t]) {
            const Widget = widgets[t]
            return (
              <Widget
                type={t}
                {...field}
                isNew={isNew}
                key={field.name}
                project={project}
                article={article}
                collection={collection}
                value={article[field.name]}
                onChange={handleChange(field)}
              />
            )
          } else {
            return (
              <WidgetUndefined
                type={t}
                {...field}
                isNew={isNew}
                key={field.name}
                project={project}
                article={article}
                collection={collection}
                value={article[field.name]}
                onChange={handleChange(field)}
              />
            )
          }
        })}
        <Button type='submit'>Save</Button>
      </form>
    </div>
  )
}
