import { useState, useEffect } from 'react'
import ButtonPush from './ButtonPush'
import { ProjectStatus } from './status'
import { Avatar, Button, Spinner } from 'flowbite-react'
import ModalNewProject from './ModalNewProject'
import { useSlimplate, projectSetup, ORG_LIST } from './react-github.jsx'
import GithubProject from '@slimplate/github-git'
import ModalDialogDelete from './ModalDialogDelete'
import { Plus, Trash, CloudUpload } from 'tabler-icons-react'

const IconGithub = props => (
  <svg aria-hidden='true' focusable='false' data-prefix='fab' data-icon='github' className='w-4 h-4 mr-2' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 496 512'>
    <path fill='currentColor' d='M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z' />
  </svg>
)

const defaultOnProject = (project) => { document.location = `/admin/${project.full_name}` }

const setupRepo = async (userName, projectName, branch, projects, setProjects, octokit, user, fs, token, corsProxy, status) => {
  // collects organization info filtered by userName
  const orgs = await octokit.graphql(ORG_LIST).then(r => r.viewer.organizations.nodes)
  const org = orgs.filter(o => o.name === userName)[0]

  // collects org repos filtered by projectName
  const repos = await octokit.request(`GET /orgs/${org.login}/repos`).then(r => r.data)
  const repo = repos.filter(r => r.name === projectName)[0]

  const git = new GithubProject(fs, repo, branch, token, user, undefined, corsProxy)
  await git.init()

  return { repo, git }
}

export default function AdminProjectList ({ userName, projectName, branch, onSelect = defaultOnProject, enableMonoView = false, onFinish = () => {} }) {
  const { projects, setProjects, octokit, user, fs, token, corsProxy, status } = useSlimplate()
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(false)

  useEffect(() => {
    if (Object.values(fs).length && enableMonoView) {
      setupRepo(userName, projectName, branch, projects, setProjects, octokit, user, fs, token, corsProxy, status).then(({ repo, git }) => {
        projectSetup(repo, git, setProjects, projects, branch)
        onFinish()
      })
    }
  }, [enableMonoView, fs])

  if (enableMonoView) {
    return (
      <div className='flex flex-col items-center justify-center'>
        <Spinner size='xl' aria-label='Please wait' />
        <p className='p-4'>Please wait...</p>
      </div>
    )
  }

  const handleDeleteProject = async () => {
    setProjectToDelete(false)
    const p = { ...projects }
    const git = new GithubProject(fs, p[projectToDelete], p[projectToDelete].default_branch, token, user, undefined, corsProxy)
    delete p[projectToDelete]
    await git.rm('')
    setProjects(p)
  }

  return (
    <>
      <ModalNewProject show={!!showProjectModal} onCancel={() => setShowProjectModal(false)} />

      <ModalDialogDelete
        show={!!projectToDelete}
        onClose={() => setProjectToDelete(false)}
        onConfirm={handleDeleteProject}
        text={`Are you sure you want to delete ${projectToDelete} project?`}
      />

      <div className='relative overflow-x-auto shadow-md sm:rounded-lg'>
        <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
          <thead className='border-b border-gray-500 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
            <tr>
              <th scope='col' className='px-6 py-3 w-[8rem]'>
                STATUS
              </th>
              <th scope='col' className='px-6 py-3'>
                NAME
              </th>
              <th scope='col' className='px-6 py-3 w-[8rem]'>
                <Button onClick={() => setShowProjectModal(true)} className='ml-auto'>
                  <Plus size='16' className='mr-2' /> New
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {(Object.values(projects) || []).map((p, i) => (
              <tr key={i} className='dark:hover:bg-gray-700 bg-white border-b dark:bg-gray-800 dark:border-gray-700'>

                <td onClick={e => onSelect(p)} className='hover:cursor-pointer px-6 py-4 '>
                  {status[p.full_name] && <ProjectStatus updating={status[p.full_name].updating} commitsAhead={status[p.full_name].commitsAhead} />}
                </td>

                <th onClick={e => onSelect(p)} scope='row' className='hover:cursor-pointer px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'>
                  <div className='flex items-center text-center whitespace-nowrap font-medium text-gray-900 dark:text-white'>
                    <Avatar
                      img={p.owner.avatar_url}
                      rounded
                      className='shrink-0'
                    />
                    <div className='pl-3'>
                      <div className='text-left text-base font-semibold'>{p.full_name}
                        <span className='ml-4 bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-500'>{p.branch?.name || p.branch}</span>
                      </div>
                    </div>
                  </div>
                </th>

                <td className='px-6 py-4'>
                  <div className='flex items-center gap-2'>
                    <ButtonPush
                      size='xs'
                      projectName={p.full_name}
                      title='sync local chnages with remote git (pull/push)'
                      className='dark:border-slate-400 dark:hover:text-neutral-300 dark:hover:bg-slate-800 dark:hover:border-neutral-300 dark:text-slate-400 dark:focus:border-slate-400 dark:focus:text-slate-400 dark:focus:ring-transparent'
                      color='gray'
                    >
                      <CloudUpload className='mr-2' size='16' />
                      {' '}Sync
                    </ButtonPush>
                    <Button title='view this project on GitHub' size='xs' color='gray' className='dark:border-slate-400 dark:hover:text-neutral-300 dark:hover:bg-slate-800 dark:hover:border-neutral-300 dark:text-slate-400 dark:focus:border-slate-400 dark:focus:text-slate-400 dark:focus:ring-transparent' target='_new' href={p.html_url}>
                      <IconGithub />
                      {' '}Github
                    </Button>
                    <Button title='delete this project from your local editor' size='xs' className='dark:border-slate-400 dark:hover:text-neutral-300 dark:hover:bg-slate-800 dark:hover:border-neutral-300 dark:text-slate-400 dark:focus:border-slate-400 dark:focus:text-slate-400 dark:focus:ring-transparent' color='gray' onClick={() => setProjectToDelete(p.full_name)}>
                      <Trash className='mr-2' size='16' />
                      {' '}Delete
                    </Button>
                    {/* <ButtonDev projectName={p.full_name}>DEV PUSH</ButtonDev> */}
                  </div>
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </>
  )
}
