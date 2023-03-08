import ReactDOM from 'react-dom/client'
import { useEffect, useState } from 'react'
import { Route, useLocation, Switch, Router } from 'wouter'
import { useLocationProperty, navigate } from 'wouter/use-location'
import { useSlimplate, SlimplateProvider, AdminProjectList, AdminCollection, AdminContent, AdminEdit, widgets } from '@slimplate/react-flowbite-github'

import Menu from './Menu.jsx'
import './index.css'

// set this up in your .env file
const { VITE_GITHUB_BACKEND, VITE_CORS_PROXY } = import.meta.env

function PageDashboard () {
  const [, navigate] = useLocation()

  if (window?.slimplate?.project) {
    const [pname, branch] = window?.slimplate?.project.split('#')
    // TODO: get branch from github if undefined
    // normal checkout

    console.log({ pname, branch })
    return `SKIP PROJECT LIST aAND CLONE ${window?.slimplate?.project}`
  }

  return (
    <AdminProjectList onSelect={p => navigate(`/${p.full_name}/${p.branch.name}`)} />
  )
}

function PageCollection ({ params: { username, project, branch } }) {
  const [, navigate] = useLocation()
  return (
    <AdminCollection
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

function App () {
  const { user } = useSlimplate()
  return (
    <div>
      <Menu />
      {user && (
        <div className='p-8'>
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
  <SlimplateProvider widgets={widgets} backendURL={VITE_GITHUB_BACKEND} corsProxy={VITE_CORS_PROXY}>
    <App />
  </SlimplateProvider>

)
