import { Button } from 'flowbite-react'
import { useGit, useSlimplate } from './react-github.jsx'
import cx from 'classnames'
import { useState } from 'react'

export default function ButtonPush ({ projectName, className, children = 'Sync', onClick = () => {}, ...props }) {
  const git = useGit(projectName)
  const { projects, setProjects } = useSlimplate()
  const [loading, setLoading] = useState(false)

  const realOnClick = async () => {
    setLoading(true)
    await git.pull()
    await git.push()
    const project = projects[projectName] || {}
    for (const c of Object.keys(project.collections)) {
      project.collections[c].content = (await git.parseCollection(project.collections[c], c)) || {}
    }
    setProjects({ ...projects, [project.full_name]: project })

    setLoading(false)

    onClick()
  }

  return (
    <Button className={cx(className, { 'animate-pulse dark:border-yellow-300 dark:text-yellow-300 dark:hover:text-yellow-300 dark:hover:border-yellow-300 dark:focus:border-yellow-300 dark:focus:text-yellow-300': loading })} {...props} onClick={realOnClick}>
      {children}
    </Button>
  )
}
