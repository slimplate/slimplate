import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Route, useLocation, Switch } from 'wouter'

import { SlimplateProvider, useSlimplate, AdminProjectList, AdminCollection, AdminContent, AdminEdit, widgets } from '@slimplate/react-flowbite-github'

import UserMenu from './UserMenu.jsx'
import './index.css'

// set this up in your .env file
const { VITE_GITHUB_BACKEND, VITE_CORS_PROXY } = import.meta.env

function PageDashboard () {
  const [, navigate] = useLocation()
  return (
    <AdminProjectList onSelect={p => navigate(`/${p.full_name}/${p.branch.name}`)} />
  )
}

function PageCollection ({ params: { username, project, branch } }) {
  const [, navigate] = useLocation()
  return (
    <>
      PageCollection
      <AdminCollection
        onSelect={c => navigate(`/${username}/${project}/${branch}/${c.name}`)}
        projectName={`${username}/${project}`}
      />
    </>
  )
}

function PageContent ({ params: { username, project, branch, collection } }) {
  const [, navigate] = useLocation()

  return (
    <>
      PageContent
      <AdminContent
        collectionName={collection}
        projectName={`${username}/${project}`}
        onCreate={() => navigate(`/new/${username}/${project}/${branch}/${collection}`)}
        onSelect={f => navigate(`/${username}/${project}/${branch}/${collection}${f.filename}`)}
      />
    </>
  )
}

function PageEdit ({ params: { username, project, branch, collection, filename } }) {
  const [, navigate] = useLocation()
  return (
    <>
      PageEdit
      <AdminEdit
        filename={`/${filename}`}
        collectionName={collection}
        projectName={`${username}/${project}`}
        onSubmit={f => navigate(`/${username}/${project}/${branch}/${collection}`)}
      />
    </>
  )
}
function PageNew ({ params: { username, project, branch, collection } }) {
  const [, navigate] = useLocation()

  return (
    <>
      PageNew
      <AdminEdit
        filename
        collectionName={collection}
        projectName={`${username}/${project}`}
        onSubmit={f => navigate(`/${username}/${project}/${branch}/${collection}`)}
      />
    </>
  )
}

function App () {
  return (
    <div className='p-8'>
      <UserMenu />
      <div className='p-4' />
      <Route path='/' component={PageDashboard} />
      <Switch>
        <Route path='/new/:username/:project/:branch/:collection' component={PageNew} />
        <Route path='/:username/:project/:branch' component={PageCollection} />
        <Route path='/:username/:project/:branch/:collection' component={PageContent} />
        <Route path='/:username/:project/:branch/:collection/:filename*' component={PageEdit} />
      </Switch>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SlimplateProvider widgets={widgets} backendURL={VITE_GITHUB_BACKEND} corsProxy={VITE_CORS_PROXY}>
      <App />
    </SlimplateProvider>
  </React.StrictMode>
)
