import { Button } from 'flowbite-react'
import { useGit } from './react-github.jsx'
import cx from 'classnames'

export default function ButtonPush ({ projectName, className, children = 'DEV', onClick = () => {}, ...props }) {
  const git = useGit(projectName)

  const realOnClick = async () => {
    console.log(await git.push())
    onClick()
  }

  return (
    <Button className={cx(className)} {...props} onClick={realOnClick}>
      {children}
    </Button>
  )
}
