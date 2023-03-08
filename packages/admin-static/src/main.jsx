import ReactDOM from 'react-dom/client'
import { useEffect, useState } from 'react'
import { Route, Redirect, useLocation, Switch, Router } from 'wouter'
import { useLocationProperty, navigate } from 'wouter/use-location'
import { useSlimplate, SlimplateProvider, AdminProjectList, AdminCollection, AdminContent, AdminEdit, widgets } from '@slimplate/react-flowbite-github'
import GithubProject from '@slimplate/github-git'

import Menu from './Menu.jsx'
import './index.css'

// set this up in your .env file
const { VITE_GITHUB_BACKEND, VITE_CORS_PROXY } = import.meta.env

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
  const { octokit, fs, token, user, corsProxy, setProjects, projects } = useSlimplate()

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
    for (const c of Object.keys(project.collections)) {
      const collection = { ...project.collections[c] }
      collection.content = (await git.parseCollection(collection, c)) || {}
      project.collections[c] = collection
      setProjects({ ...projects, [project.full_name]: project })
    }
  }

  if (window?.slimplate?.project) {
    cloneRepo()

    console.log(projects)

    return (
      <Redirect to={`/${window?.slimplate?.project}/${window?.slimplate?.branch}`} />
    )
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
