import { useState } from 'react'
import { useSlimplate } from '@slimplate/react-github'
import { Dropdown, Avatar, Button } from 'flowbite-react'
import { ModalNewProject } from '@slimplate/react-flowbite-github'

export default function UserMenu () {
  const { user, setUser, setToken, backendURL } = useSlimplate()
  const [open, setOpen] = useState(false)
  const scope = encodeURIComponent('repo read:org read:user user:email')

  const logout = () => {
    setToken(false)
    setUser(false)
  }

  return (
    <>
      {open && (<ModalNewProject onCancel={() => setOpen(false)} />)}

      {!user && (<Button href={`${backendURL}?scope=${scope}&redir=${encodeURIComponent(document.location.origin)}`}>Login</Button>)}
      {user && (
        <Dropdown
          arrowIcon={false}
          inline
          label={<Avatar alt='User settings' img={user.avatar_url} rounded />}
        >
          <Dropdown.Header>
            <span className='block text-sm'>
              signed in as <span className='text-yellow-300'>{user.login}</span>
            </span>
          </Dropdown.Header>
          <Dropdown.Item onClick={() => setOpen(true)}>
            Add a new Project
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={logout}>
            Sign out
          </Dropdown.Item>
        </Dropdown>)}

    </>
  )
}
