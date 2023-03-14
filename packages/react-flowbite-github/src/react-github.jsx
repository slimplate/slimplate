
import { createContext, useContext, useState, useEffect } from 'react'
import GithubProject from '@slimplate/github-git'
import LightningFS from '@isomorphic-git/lightning-fs'
import minimatch from 'minimatch'
import { Octokit } from '@octokit-next/core'

export const context = createContext({})
export const useSlimplate = () => useContext(context)

export const ORG_LIST = `
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

export async function projectSetup (repo, git, setProjects, projects, branch) {
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

export const useGit = (projectName) => {
  const { projects, fs, user, token, corsProxy } = useSlimplate()
  const [git, setGit] = useState({})
  useEffect(() => {
    if (projectName && user && token && fs && projects && projects[projectName]) {
      const g = new GithubProject(fs, projects[projectName], projects[projectName].branch, token, user, undefined, corsProxy)
      setGit(g)
    }
  }, [projectName, user, token, fs])
  return git
}

// Hook hat works simialr tio useState, but persists in localStorage
export function useLocalStorage (key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })
  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.log(error)
    }
  }
  return [storedValue, setValue]
}

// simialr to useState (or useLocalStorage) but use JSON file in virtual filesystem
export function useFsUser (fs, filename, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue)

  useEffect(() => {
    if (fs?.promises) {
      fs?.promises.lstat(filename)
        .then(s => {
          fs?.promises.readFile(filename, 'utf8')
            .then(j => {
              setStoredValue(JSON.parse(j))
            })
        })
        .catch(() => {})
    }
  }, [fs])

  const setValue = (value) => {
    fs?.promises.writeFile(filename, JSON.stringify(value, null, 2))
      .then(() => {
        setStoredValue(value)
      })
  }

  return [storedValue, setValue]
}

function HasUser ({ widgets, children, user, setUser, token, setToken, backendURL, corsProxy }) {
  const [fs, setFs] = useState({})
  const [projects, setProjects] = useFsUser(fs, '/projects.json', {})
  const [status, setStatus] = useState(Object.keys(projects).reduce((a, c) => ({ ...a, [c]: { updating: true, collections: {}, files: {}, commitsAhead: 0 } }), {}))

  useEffect(() => {
    if (user?.login) {
      const f = new LightningFS(user.login)
      setFs(f)
      // for console.debugging
      window.pfs = f.promises
    }
  }, [user?.login])

  const updateStatus = async () => {
    if (!projects || !Object.keys(projects).length || !token || !user) {
      // console.log('skipping',{ projects, token, user})
      return
    }

    for (const project of Object.values(projects)) {
      const newStatus = {
        ...status
      }
      newStatus[project.full_name] ||= {}
      newStatus[project.full_name].updating = true

      // wipes content
      setStatus(newStatus)

      const git = new GithubProject(fs, project, project.branch, token, user, undefined, corsProxy)
      const remote = (await git.fetch()).fetchHead
      const log = await git.log()
      const local = log[0].oid

      const diff = await git.diff(remote, local)
      newStatus[project.full_name].files = diff.reduce((a, c) => ({ ...a, [c.path]: c.type }), {})
      newStatus[project.full_name].commitsAhead = log.findIndex(c => c.oid === remote)

      for (const collection of Object.values(project.collections)) {
        newStatus[project.full_name].collections ||= {}
        newStatus[project.full_name].collections[collection.name] = new Set()
        for (const changes of diff) {
          if (minimatch(changes.path, collection.files) && changes.type !== 'equal') { // equal/modify/added/removed
            newStatus[project.full_name].collections[collection.name].add(changes.type)
          }
        }
        newStatus[project.full_name].collections[collection.name] = [...newStatus[project.full_name].collections[collection.name]]
        newStatus[project.full_name].updating = false
      }

      setStatus({ ...newStatus })
    }
  }

  // interval to updatye current status of repo
  useEffect(() => {
    updateStatus()
    const i = setInterval(updateStatus, 10000)
    return () => clearInterval(i)
  }, [projects, token, user, corsProxy])

  const octokit = new Octokit({ auth: token })

  return (
    <context.Provider value={{
      widgets,
      status,
      user,
      fs,
      setUser,
      token,
      setToken,
      backendURL,
      projects,
      setProjects,
      corsProxy,
      octokit
    }}
    >
      {children}
    </context.Provider>
  )
}

export function SlimplateProvider ({ widgets = {}, children, backendURL, corsProxy = 'https://cors.isomorphic-git.org/' }) {
  const [user, setUser] = useLocalStorage('user', false)
  const [token, setToken] = useLocalStorage('gh', false)

  useEffect(() => {
    const s = new URL(document.location)
    const gh = s.searchParams.get('gh')

    if (gh) {
      setToken(gh)
      s.searchParams.delete('gh')
      document.location = s.toString()
    }
  }, [])

  if (token && !user) {
    globalThis.octokit = new Octokit({ auth: token })
    globalThis.octokit.request('GET /user', {})
      .then(async u => {
        const emails = await globalThis.octokit.request('GET /user/emails', {})
        u.data.emails = emails?.data
        if (emails?.data.length) {
          u.data.email = emails.data[0].email
        }
        setUser(u.data)
      })
  }

  if (user) {
    return (
      <HasUser widgets={widgets} user={user} setUser={setUser} token={token} setToken={setToken} corsProxy={corsProxy}>
        {children}
      </HasUser>
    )
  }

  return (
    <context.Provider value={{
      widgets,
      user,
      setUser,
      token,
      setToken,
      backendURL,
      corsProxy,
      octokit: false,
      projects: {},
      setProjects: () => {}
    }}
    >
      {children}
    </context.Provider>
  )
}
