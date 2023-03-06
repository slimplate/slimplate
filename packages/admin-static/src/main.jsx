import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

import { SlimplateProvider, useSlimplate, AdminProjectList, AdminCollection, AdminContent, AdminEdit, widgets } from '@slimplate/react-flowbite-github'
import '@slimplate/react-flowbite-github/style.css'

import UserMenu from './UserMenu.jsx'
import './index.css'

// set this up in your .env file
const { VITE_GITHUB_BACKEND, VITE_CORS_PROXY } = import.meta.env

function App () {
  const [selectedContent, setSelectedContent] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState(false)
  const [selectedProject, setSelectedProject] = useState(false)
  const { user } = useSlimplate()

  const handleSelectedCollection = (collection, project) => {
    setSelectedCollection(collection.name)
    setSelectedContent(false)
  }

  const handleSelectedArticle = (article, collection, project) => {
    setSelectedContent(article.filename)
  }

  const handleCreateArticle = () => {
    console.log('CREATE ARTICLE')
    setSelectedContent(false)
    setSelectedContent(true)
  }

  return (
    <div className='p-8'>
      <UserMenu />
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
