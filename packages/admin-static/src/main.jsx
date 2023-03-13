import ReactDOM from 'react-dom/client'
import { useEffect, useState } from 'react'
import { ChevronRight } from 'tabler-icons-react'
import { Route, Redirect, useLocation, Switch, Router, Link } from 'wouter'
import { useLocationProperty, navigate } from 'wouter/use-location'
import { useSlimplate, SlimplateProvider, AdminProjectList, AdminCollection, AdminContent, AdminEdit, widgets } from '@slimplate/react-flowbite-github'
import GithubProject from '@slimplate/github-git'
import { titleize } from '@slimplate/utils'
import Menu from './Menu.jsx'
import './index.css'

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

function PageDashboard () {
  const [, navigate] = useLocation()

  if (window?.slimplate?.project) {
    return (
      <Redirect to={`/${window?.slimplate?.project}/${window?.slimplate?.branch}`} />
    )
  }

  return (
    <AdminProjectList onSelect={p => navigate(`/${p.full_name}/${p.branch?.name || p.branch}`)} />
  )
}

function PageCollection ({ params: { username, project, branch } }) {
  const [, navigate] = useLocation()
  const hasSlimplateConfig = window?.slimplate?.project
  const { octokit, fs, token, user, corsProxy, setProjects, projects } = useSlimplate()

  const [setup, setSetup] = useState(false)

  const cloneRepo = async () => {
    const [orgName, repoName] = window?.slimplate?.project.split('/')
    const branch = window?.slimplate?.branch

    const orgs = await octokit.graphql(ORG_LIST).then(r => r.viewer.organizations.nodes)
    const org = orgs.filter(o => o.name === orgName)[0]

    const repos = await octokit.request(`GET /orgs/${org.login}/repos`).then(r => r.data)
    const repo = repos.filter(r => r.name === repoName)[0]

    const git = new GithubProject(fs, repo, branch, token, user, undefined, corsProxy)
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
    //     for (const c of Object.keys(project.collections)) {
    //       const collection = { ...project.collections[c] }
    //
    //       collection.content = (await git.parseCollection(collection, c)) || {}
    //       project.collections[c] = collection
    //       setProjects({ ...projects, [project.full_name]: project })
    //     }
  }

  useEffect(() => {
    if (fs?.init) {
      cloneRepo().then(() => {
        setSetup(true)
      })
    }
  }, [fs, username, project, branch])

  if (!setup) {
    return (<div>Please wait...</div>)
  }

  return (
    <AdminCollection
      showSync={hasSlimplateConfig}
      onSelect={c => navigate(`/${username}/${project}/${branch}/${c.name}`)}
      projectName={`${username}/${project}`}
    />
  )
}

function PageContent ({ params: { username, project, branch, collection } }) {
  const [, navigate] = useLocation()
  const d = useSlimplate()

  if (
    !Object.keys(d?.projects || {}).length ||
    !d.projects[`${username}/${project}`] ||
    !d.projects[`${username}/${project}`]?.collections[collection] ||
    !d.status || !d.status[`${username}/${project}`]
  ) {
    return null
  }

  return (
    <AdminContent
      collectionName={collection}
      projectName={`${username}/${project}`}
      onCreate={() => navigate(`/new/${username}/${project}/${branch}/${collection}`)}
      onSelect={f => navigate(`/${username}/${project}/${branch}/${collection}${f.filename}`)}
    />
  )
}

function PageEdit ({ params: { username, project, branch, collection, filename } }) {
  const [, navigate] = useLocation()

  const d = useSlimplate()

  if (
    !Object.keys(d?.projects || {}).length ||
    !d.projects[`${username}/${project}`] ||
    !d.projects[`${username}/${project}`]?.collections[collection] ||
    !d.status || !d.status[`${username}/${project}`]
  ) {
    return null
  }

  return (
    <AdminEdit
      filename={`/${filename}`}
      collectionName={collection}
      projectName={`${username}/${project}`}
      onSubmit={f => navigate(`/${username}/${project}/${branch}/${collection}`)}
    />
  )
}
function PageNew ({ params: { username, project, branch, collection } }) {
  const [, navigate] = useLocation()

  return (
    <AdminEdit
      filename
      collectionName={collection}
      projectName={`${username}/${project}`}
      onSubmit={f => navigate(`/${username}/${project}/${branch}/${collection}`)}
    />
  )
}

// returns the current hash location in a normalized form
// (excluding the leading '#' symbol)
const hashLocation = () => window.location.hash.replace(/^#/, '') || '/'

const hashNavigate = (to) => navigate('#' + to)

const useHashLocation = () => {
  const location = useLocationProperty(hashLocation)
  return [location, hashNavigate]
}

const BreadCrumb = () => {
  const [location] = useHashLocation()
  const [crumbs, setCrumbs] = useState({})
  const hasSlimplateConfig = window?.slimplate?.project

  useEffect(() => {
    const paramsCopy = [...location.split('/')]
    const newIdx = paramsCopy.indexOf('new')

    if (newIdx !== -1) {
      // is new
      paramsCopy.splice(newIdx, 1)
      const project = paramsCopy.splice(0, 4).join('/')
      const collection = paramsCopy[0] || false

      setCrumbs({
        project,
        collection,
        article: `New ${titleize(collection)}`
      })
    } else {
      const project = paramsCopy.splice(0, 4).join('/')
      const collection = paramsCopy.length ? paramsCopy.splice(0, 1)[0] : false
      const article = paramsCopy.at(-1) || false

      project.replace('_', ' ').toUpperCase()

      setCrumbs({
        project,
        collection,
        article: article || false
      })
    }
  }, [location])

  return (
    <nav className='dark:text-slate-800 flex pb-4' aria-label='Breadcrumb'>
      <ol className='inline-flex items-center space-x-1 md:space-x-3'>
        {!hasSlimplateConfig && (
          <li className='inline-flex items-center'>
            <Link href='/' className='inline-flex items-center ml-1 text-sm font-medium md:ml-2'>
              Projects
            </Link>
          </li>
        )}
        {crumbs.project && crumbs.project !== '/' && (
          <li className='inline-flex items-center'>
            {!hasSlimplateConfig && <ChevronRight size='16' />}
            <Link href={`#${crumbs.project}`} className='inline-flex items-center ml-1 text-sm font-medium md:ml-2'>
              Collections
            </Link>
          </li>
        )}
        {crumbs.collection && (
          <li className='flex items-center'>
            <ChevronRight size='16' />
            <Link href={`#${crumbs.project}/${crumbs.collection}`} className='ml-1 text-sm font-medium md:ml-2'>{titleize(crumbs.collection)}</Link>
          </li>
        )}
        {crumbs.article && (
          <li className='flex items-center'>
            <ChevronRight size='16' />
            <span className='ml-1 text-sm font-medium md:ml-2'>{crumbs.article}</span>
          </li>
        )}
      </ol>
    </nav>
  )
}

function App () {
  const { user } = useSlimplate()

  return (
    <div>
      <Menu showProjectModal={!window?.slimplate?.project} />
      {user && (
        <div className='p-8'>
          <BreadCrumb />
          <Router hook={useHashLocation}>
            <Route path='/' component={PageDashboard} />
            <Switch>
              <Route path='/new/:username/:project/:branch/:collection' component={PageNew} />
              <Route path='/:username/:project/:branch' component={PageCollection} />
              <Route path='/:username/:project/:branch/:collection' component={PageContent} />
              <Route path='/:username/:project/:branch/:collection/:filename*' component={PageEdit} />
            </Switch>
          </Router>
        </div>
      )}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <SlimplateProvider widgets={widgets} backendURL={window?.slimplate?.backendURL} corsProxy={window?.slimplate?.corsProxy}>
    <App />
  </SlimplateProvider>

)
