import { Button } from 'flowbite-react'
import { useGit } from '@slimplate/react-github'
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
