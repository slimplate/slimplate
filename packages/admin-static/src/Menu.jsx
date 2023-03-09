import cx from 'classnames'
import { useState } from 'react'
import { Menu2 } from 'tabler-icons-react'
import { Dropdown, Avatar, Button } from 'flowbite-react'
import { useSlimplate, ModalNewProject } from '@slimplate/react-flowbite-github'
import { Link } from 'wouter'

export default function Menu ({ showProjectModal }) {
  const [openMenu, setOpenMenu] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const { user, setUser, setToken, backendURL } = useSlimplate()
  const scope = encodeURIComponent('repo read:org read:user user:email')

  const logout = () => {
    setToken(false)
    setUser(false)
  }

  return (
    <nav className='bg-white border-gray-200 px-2 sm:px-4 py-2.5 dark:bg-slate-800'>
      <div className='flex flex-wrap items-center justify-between mx-4'>

        <Link href='/' className='flex items-center dark:text-white hover:cursor-pointer'>
          <img src='https://cdn.jsdelivr.net/gh/slimplate/branding/logo.png' className='h-6 mr-3 sm:h-9' alt='Slimplate Logo' />
          <span className='self-center text-xl font-semibold whitespace-nowrap'>Slimplate site</span>
        </Link>

        {!user && (
          <Button href={`${backendURL}?scope=${scope}&redir=${encodeURIComponent(document.location.origin)}`}>Login</Button>
        )}

        {user && (
          <>
            <ModalNewProject show={openModal} onCancel={() => setOpenModal(false)} />

            <button onClick={() => setOpenMenu(!openMenu)} type='button' className='inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600'>
              <Menu2 />
            </button>

            <div className={cx({ hidden: !openMenu }, 'w-full md:block md:w-auto border-t md:border-none my-4 md:my-2')}>
              <ul className='flex flex-col gap-2 text-slate-300 md:items-center mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium '>
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
                    {showProjectModal && (
                      <>
                        <Dropdown.Item onClick={() => setOpenModal(true)}>
                          Add a new Project
                        </Dropdown.Item>
                        <Dropdown.Divider />
                      </>
                    )}
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
