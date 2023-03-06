import { useState, useEffect } from 'react'
import { useSlimplate } from './react-github.jsx'
import { Spinner, Badge, Pagination, Avatar, Button, Modal } from 'flowbite-react'
import cx from 'classnames'
import GithubProject from '@slimplate/github-git'

const ORG_LIST = `
query ORG_LIST { 
    viewer {
      organizations (first:100) {
        totalCount
        nodes {
          name
          login
          avatarUrl
        }
      }
    }
  }
`

const OrgList = ({ onChange }) => {
  const { octokit, user } = useSlimplate()
  const [list, setList] = useState([])

  useEffect(() => {
    if (octokit.graphql) {
      octokit.graphql(ORG_LIST).then(r => {
      // add user to list
        r.viewer.organizations.nodes.unshift({ name: user.name, avatarUrl: user.avatar_url, login: user.login })
        setList(r.viewer.organizations.nodes)
      })
    }
  }, [])

  return (
    <>
      {!list.length && (
        <div className='text-center'>
          <Spinner aria-label='Center-aligned spinner example' />
        </div>
      )}
      {!!list.length && (
        <p className='text-sm font-normal text-gray-500 dark:text-gray-400'>
          Please select an org:
        </p>
      )}

      <ul className='my-4 space-y-3'>
        {
          list.map(l => (
            <li key={l.name}>
              <a
                href='#'
                onClick={() => onChange(l)}
                className='group flex items-center rounded-lg bg-gray-50 p-3 text-base font-bold text-gray-900 hover:bg-gray-100 hover:shadow dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500'
              >
                <Avatar alt='User settings' img={l.avatarUrl} rounded />
                <span className='ml-3 flex-1 whitespace-nowrap'>
                  {l.name}
                </span>
              </a>
            </li>
          ))
        }
      </ul>
    </>
  )
}

const rLastPage = /&page=([0-9]+)>; rel="last"/gm

const RepoList = ({ org, onChange }) => {
  const { octokit, user } = useSlimplate()
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(false)
  const [repos, setRepos] = useState([])
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setRepos([])
    if (org.login === user.login) {
      octokit.request('GET /user/repos', { per_page: 5, sort: 'updated', page }).then(r => {
        const m = rLastPage.exec(r.headers.link)
        if (m) {
          setTotalPages(m[1])
        }
        setRepos(r.data)
      })
    } else {
      octokit.request(`GET /orgs/${org.login}/repos`, { per_page: 5, sort: 'updated', page }).then(r => {
        const m = rLastPage.exec(r.headers.link)
        if (m) {
          setTotalPages(m[1])
        }
        setRepos(r.data)
      })
    }
  }, [org.login, page])

  const handleClick = async (repo) => {
    setSelected(repo.name)
    onChange(repo)
  }

  return (
    <div className='h-[440px] flex flex-col justify-between'>
      <h2 className='dark:text-gray-400 flex items-center gap-2'>
        <Avatar alt='User settings' img={org.avatarUrl} rounded />
        {org.login}{!!selected && `/${selected}`}
      </h2>

      {repos && (
        <ul className='my-4 space-y-3'>
          {
            repos.map((r, i) => (
              <li key={i} onClick={() => handleClick(r)}>
                <a
                  href='#'
                  onClick={() => onChange(r)}
                  className={cx('border dark:border-gray-500 group flex items-center rounded-lg bg-gray-50 p-3 text-base font-bold text-gray-900 hover:bg-gray-100 hover:shadow dark:text-white dark:hover:bg-gray-500', { 'dark:hover:bg-gray-800 dark:bg-gray-800': selected === r.name, 'dark:bg-gray-600': selected !== r.name })}
                >
                  <span className='ml-3 flex-1 whitespace-nowrap'>
                    {r.name}
                  </span>
                  <Badge size='sm' color='info'>
                    {r.private ? 'Private' : 'Public'}
                  </Badge>
                </a>
              </li>
            ))
          }
        </ul>
      )}

      {!repos.length && (
        <div className='text-center'>
          <Spinner aria-label='Center-aligned spinner example' />
        </div>
      )}

      {repos && (
        <div className='flex-col gap-4 items-center justify-center text-center dark:text-gray-400'>
          {page} / {totalPages}

          <Pagination
            showIcons
            currentPage={page}
            layout='navigation'
            onPageChange={setPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  )
}

const BranchSelector = ({ onChange, repo }) => {
  const { octokit } = useSlimplate()
  const [branches, setBranches] = useState([{ name: 'main' }])
  const [selected, setSelected] = useState(false)

  useEffect(() => {
    octokit.request(`GET /repos/${repo.owner.login}/${repo.name}/branches`, {}).then(r => {
      if (r.data.length) {
        setBranches(r.data)
      }
    })
  }, [])

  const handleClick = (branch) => {
    setSelected(branch.name)
  }

  return (
    <div>
      <h2 className='dark:text-gray-400 flex items-center gap-2'>
        Branch {!!selected && `/${selected}`}
      </h2>
      {branches && (
        <ul className='my-4 space-y-3'>
          {
            branches.map((r, i) => (
              <li key={i} onClick={() => handleClick(r)}>
                <a
                  href='#'
                  onClick={() => onChange(r)}
                  className={cx('border dark:border-gray-500 group flex items-center rounded-lg bg-gray-50 p-3 text-base font-bold text-gray-900 hover:bg-gray-100 hover:shadow dark:text-white dark:hover:bg-gray-500', { 'dark:hover:bg-gray-800 dark:bg-gray-800': selected === r.name, 'dark:bg-gray-600': selected !== r.name })}
                >
                  <span className='ml-3 flex-1 whitespace-nowrap'>
                    {r.name}
                  </span>
                </a>
              </li>
            ))
          }
        </ul>
      )}
    </div>
  )
}

export default function ModalNewProject ({ onCancel }) {
  const [org, setOrg] = useState(false)
  const [repo, setRepo] = useState(false)
  const [branch, setBranch] = useState(false)

  const { projects, setProjects, token, user, fs, corsProxy } = useSlimplate()

  const handleRepoSelected = async () => {
    const git = new GithubProject(fs, repo, repo.default_branch, token, user, undefined, corsProxy)
    await git.init()
    const project = {
      ...JSON.parse(await git.read('.slimplate.json', 'utf8')),
      owner: {
        avatar_url: repo.owner.avatar_url,
        login: repo.owner.login
      },
      clone_url: repo.clone_url,
      name: repo.name,
      full_name: repo.full_name,
      html_url: repo.html_url,
      branch,
      status: 'loading'
    }

    for (const name of Object.keys(project.collections)) {
      project.collections[name].name = name
    }

    setProjects({ ...projects, [project.full_name]: project })
    handleCancel()
    for (const c of Object.keys(project.collections)) {
      const collection = { ...project.collections[c] }
      collection.content = (await git.parseCollection(collection, c)) || {}
      project.collections[c] = collection
      setProjects({ ...projects, [project.full_name]: project })
    }
  }

  const handleCancel = () => {
    setOrg(false)
    setRepo(false)
    setBranch(false)
    onCancel()
  }

  const handleBack = () => {
    if (branch) {
      setBranch(false)
    } else if (repo) {
      setRepo(false)
    } else {
      setOrg(false)
    }
  }

  return (

    <Modal show onClose={handleCancel}>
      <Modal.Header className='dark:bg-gray-800'>
        Add a New Project
      </Modal.Header>
      <Modal.Body className='dark:bg-gray-800'>
        <div className='space-y-6'>
          {!org && <OrgList onChange={setOrg} />}
          {org && !repo && <RepoList onChange={setRepo} org={org} />}
          {repo && <BranchSelector onChange={setBranch} repo={repo} />}
        </div>
      </Modal.Body>
      <Modal.Footer className='flex justify-end gap-2 dark:bg-gray-800 '>
        {org && (
          <Button color='light' className='mr-auto' onClick={handleBack}>
            Back
          </Button>
        )}

        <Button color='gray' onClick={handleCancel}>
          Cancel
        </Button>
        <Button disabled={!branch} onClick={handleRepoSelected}>
          Ok
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
