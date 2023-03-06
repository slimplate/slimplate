import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Route, useLocation } from 'wouter'

import { SlimplateProvider, useSlimplate, AdminProjectList, AdminCollection, AdminContent, AdminEdit, widgets } from '@slimplate/react-flowbite-github'

import UserMenu from './UserMenu.jsx'
import './index.css'

// set this up in your .env file
const { VITE_GITHUB_BACKEND, VITE_CORS_PROXY } = import.meta.env

/*
<div className='p-4' />
      {!!user && (<AdminProjectList onSelect={p => setSelectedProject(p.full_name)} />)}
      {!user && (<div>Please login.</div>)}

      {!!selectedProject && (
        <>
          <div className='p-4' />
          <AdminCollection
            onSelect={handleSelectedCollection}
            projectName={selectedProject}
          />
        </>
      )}

      {!!selectedCollection && (
        <>
          <div className='p-4' />
          <AdminContent
            onCreate={handleCreateArticle}
            onSelect={handleSelectedArticle}
            onDelete={() => setSelectedContent(false)}
            projectName={selectedProject}
            collectionName={selectedCollection}
          />
        </>
      )}

      {!!selectedContent && (
        <>
          <div className='p-4' />
          <AdminEdit
            projectName={selectedProject}
            collectionName={selectedCollection}
            filename={selectedContent}
            onSubmit={() => setSelectedContent(false)}
          />
        </>
      )}
*/

function PageDashboard () {
  const [, navigate] = useLocation()
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

function App () {
  return (
    <div className='p-8'>
      <UserMenu />
      <div className='p-4' />
      <Route path='/' component={PageDashboard} />
      <Route path='/:username/:project/:branch' component={PageCollection} />
      <Route path='/:username/:project/:branch/:collection'>ADMIN CONTENT</Route>
      <Route path='/:username/:project/:branch/:collection/:filename*'>ADMIN EDIT</Route>
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
