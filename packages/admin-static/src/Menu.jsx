import cx from 'classnames'
import { useState } from 'react'
import { Dropdown, Avatar, Button } from 'flowbite-react'
import { useSlimplate, ModalNewProject } from '@slimplate/react-flowbite-github'

export default function Menu () {
  const [open, setOpen] = useState(false)
  const { user, setUser, setToken, backendURL } = useSlimplate()
  const scope = encodeURIComponent('repo read:org read:user user:email')

  const logout = () => {
    setToken(false)
    setUser(false)
  }

  return (
    <nav className='bg-white border-gray-200 px-2 sm:px-4 py-2.5 dark:bg-slate-800'>
      <div className='container flex flex-wrap items-center justify-between mx-auto'>

        <a href='/' className='flex items-center dark:text-white hover:cursor-pointer'>
          <img src='./slimplate.png' className='h-6 mr-3 sm:h-9' alt='Flowbite Logo' />
          <span className='self-center text-xl font-semibold whitespace-nowrap'>Slimplate site</span>
        </a>

        {!user && (
          <Button href={`${backendURL}?scope=${scope}&redir=${encodeURIComponent(document.location.origin)}`}>Login</Button>
        )}

        {user && (
          <>
            <ModalNewProject show={open} onCancel={() => setOpen(false)} />

            <button onClick={() => setOpen(!open)} type='button' className='inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600'>
              <svg className='w-6 h-6' aria-hidden='true' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'><path fillRule='evenodd' d='M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z' clipRule='evenodd' /></svg>
            </button>
            <div className={cx({ hidden: !open }, 'w-full md:block md:w-auto border-t md:border-none my-4 md:my-2')}>
              <ul className='flex flex-col gap-4 text-slate-300 md:items-center mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium '>
                <li className='hover:text-white hover:cursor-pointer'>
                  Collections
                </li>

                <li className={cx('hidden md:block')}>
                  {/* user dropdown */}
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
                  </Dropdown>
                </li>

                <li onClick={logout} className='md:hidden hover:text-white hover:cursor-pointer'>
                  Sign out
                </li>
              </ul>
            </div>
          </>
        )}

      </div>
    </nav>

  )
}
