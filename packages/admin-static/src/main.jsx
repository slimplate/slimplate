import Menu from './Menu.jsx'
import ReactDOM from 'react-dom/client'
import { useEffect, useState } from 'react'
import { titleize } from '@slimplate/utils'
import { ChevronRight } from 'tabler-icons-react'
import { Route, useLocation, Switch, Router, Link } from 'wouter'
import { useLocationProperty, navigate } from 'wouter/use-location'
import { useSlimplate, SlimplateProvider, AdminProjectList, AdminCollection, AdminContent, AdminEdit, widgets } from '@slimplate/react-flowbite-github'

import './index.css'

function PageDashboard () {
  const hasSlimplateConfig = window?.slimplate?.project

  if (hasSlimplateConfig) {
    const [userName, projectName] = window?.slimplate?.project.split('/')
    const branch = window?.slimplate?.branch

    return (
      <AdminProjectList
        branch={branch}
        userName={userName}
        projectName={projectName}
        enableMonoView={window?.slimplate?.project}
        onFinish={p => hashNavigate(`/${window?.slimplate?.project}/${window?.slimplate?.branch}`)}
        onSelect={p => hashNavigate(`/${p.full_name}/${p.branch?.name || p.branch}`)}
      />
    )
  }

  return (
    <AdminProjectList onSelect={p => hashNavigate(`/${p.full_name}/${p.branch?.name || p.branch}`)} />
  )
}

function PageCollection ({ params: { username, projectName, branch } }) {
  const [, navigate] = useLocation()
  const hasSlimplateConfig = window?.slimplate?.project

  return (
    <AdminCollection
      showSync={hasSlimplateConfig}
      onSelect={c => navigate(`/${username}/${projectName}/${branch}/${c.name}`)}
      projectName={`${username}/${projectName}`}
    />
  )
}

function PageContent ({ params: { username, projectName, branch, collection } }) {
  const [, navigate] = useLocation()
  const d = useSlimplate()

  if (
    !Object.keys(d?.projects || {}).length ||
    !d.projects[`${username}/${projectName}`] ||
    !d.projects[`${username}/${projectName}`]?.collections[collection] ||
    !d.status || !d.status[`${username}/${projectName}`]
  ) {
    return null
  }

  return (
    <AdminContent
      collectionName={collection}
      projectName={`${username}/${projectName}`}
      onCreate={() => navigate(`/new/${username}/${projectName}/${branch}/${collection}`)}
      onSelect={f => navigate(`/${username}/${projectName}/${branch}/${collection}${f.filename}`)}
    />
  )
}

function PageEdit ({ params: { username, projectName, branch, collection, filename } }) {
  const [, navigate] = useLocation()

  const d = useSlimplate()

  if (
    !Object.keys(d?.projects || {}).length ||
    !d.projects[`${username}/${projectName}`] ||
    !d.projects[`${username}/${projectName}`]?.collections[collection] ||
    !d.status || !d.status[`${username}/${projectName}`]
  ) {
    return null
  }

  return (
    <AdminEdit
      filename={`/${filename}`}
      collectionName={collection}
      projectName={`${username}/${projectName}`}
      onSubmit={f => navigate(`/${username}/${projectName}/${branch}/${collection}`)}
    />
  )
}
function PageNew ({ params: { username, projectName, branch, collection } }) {
  const [, navigate] = useLocation()

  return (
    <AdminEdit
      filename
      collectionName={collection}
      projectName={`${username}/${projectName}`}
      onSubmit={f => navigate(`/${username}/${projectName}/${branch}/${collection}`)}
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
              <Route path='/new/:username/:projectName/:branch/:collection' component={PageNew} />
              <Route path='/:username/:projectName/:branch' component={PageCollection} />
              <Route path='/:username/:projectName/:branch/:collection' component={PageContent} />
              <Route path='/:username/:projectName/:branch/:collection/:filename*' component={PageEdit} />
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
