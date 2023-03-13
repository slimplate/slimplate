/* eslint-disable no-template-curly-in-string */

// represents a single git repo, in browser, from Github
import { Buffer } from 'buffer'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/web/index.js'
import minimatch from 'minimatch'
import frontmatter from 'frontmatter'
import { titleize } from 'inflection'
import { tt, dateFormat } from '@slimplate/utils'

globalThis.Buffer = Buffer

// represents a single github project/collection
export default class GithubProject {
  constructor (fs, repo, branch, token, user, repoUrl, corsProxy = 'https://cors.isomorphic-git.org') {
    this.repo = repo
    this.branch = branch?.name || branch || 'main'
    this.token = token
    this.user = user
    this.repoUrl = repoUrl || `https://github.com/${this.repo.full_name}.git`
    this.corsProxy = corsProxy

    this.fs = fs
    this.pfs = this.fs.promises
  }

  // return true if the file/dir exists in filesystyem
  async exists (filename = '') {
    try {
      await this.pfs.lstat(`/${this.repo.full_name}/${filename}`)
      return true
    } catch (e) {
      return false
    }
  }

  // pull/clone a repo to local filesystem
  async init () {
    this.updated = false
    if (await this.exists()) {
      await this.pull()
    } else {
      await this.clone()
    }
    this.updated = true
  }

  // get the URL to this repo, but with username/password (for basic auth)
  getAuthUrl () {
    const u = new URL(this.repoUrl)
    u.username = this.user.login
    u.password = this.token
    return u.toString()
  }

  // clone a repo
  async clone (opts) {
    const o = {
      fs: this.fs,
      http,
      dir: `/${this.repo.full_name}`,
      corsProxy: this.corsProxy,
      url: this.getAuthUrl(),
      ref: this.branch,
      singleBranch: true,
      depth: 1,
      author: {
        name: this.user.name,
        email: this.user.email || this.user.login
      },
      ...opts
    }
    await git.clone(o)
  }

  // get a git log
  async log (opts = {}) {
    return git.log({
      fs: this.fs,
      dir: `/${this.repo.full_name}`,
      ...opts
    })
  }

  // fetches updates to remote
  async fetch (opts = {}) {
    return git.fetch({
      fs: this.fs,
      http,
      dir: `/${this.repo.full_name}`,
      corsProxy: this.corsProxy,
      url: this.getAuthUrl(),
      ref: this.branch,
      ...opts
    })
  }

  // gets a status for project
  async status (opts = {}) {
    return git.fetch({
      fs: this.fs,
      ref: this.branch,
      http,
      dir: `/${this.repo.full_name}`,
      corsProxy: this.corsProxy,
      url: this.getAuthUrl(),
      ...opts
    })
  }

  // get a single file from filesystem
  async read (filename, encoding) {
    return this.pfs.readFile(`/${this.repo.full_name}/${filename}`, encoding)
  }

  // write a single file to filesystem
  async write (filename, contents) {
    return this.pfs.writeFile(`/${this.repo.full_name}/${filename}`, contents)
  }

  // delete a file or dir, recursively, from filesystem
  async rm (filepath, opts) {
    await git.remove({
      fs: this.fs,
      dir: `/${this.repo.full_name}`,
      filepath: filepath.replace(/^\//, ''),
      ...opts
    })
    await this.pfs.unlink(`/${this.repo.full_name}/${filepath}`, { recursive: true, force: true, ...opts })
  }

  // check the status of the entire project
  async checkStatus () {
    return Promise.all((await this.allFiles()).map(async f => {
      const filepath = f.filename.replace(/^\//, '').replace(this.repo.full_name, '').replace(/^\//, '')
      const status = await git.status({
        fs: this.fs,
        dir: `/${this.repo.full_name}`,
        filepath
      })

      return { filepath, status }
    }))
  }

  // get a remote list of git refs
  async listServerRefs (opts) {
    return git.listServerRefs({
      http,
      corsProxy: this.corsProxy,
      url: this.getAuthUrl(),
      ...opts
    })
  }

  // git add a file
  async add (filepath, opts) {
    return git.add({
      fs: this.fs,
      filepath: filepath.replace(/^\//, ''),
      dir: `/${this.repo.full_name}`,
      ...opts
    })
  }

  // git commit local filesystem, message is a string-template
  async commit (message = '${user.login} commit from web', opts) {
    return git.commit({
      fs: this.fs,
      dir: `/${this.repo.full_name}`,
      author: {
        name: this.user.name,
        email: this.user.email || this.user.login
      },
      message: tt(message, this),
      ...opts
    })
  }

  // get diff between two commits
  async diff (commitHash1, commitHash2) {
    // pre-compute array of all files
    const filesWeCareAbout = Object.values(this?.repo?.collections || {}).map(({ files }) => files)

    return git.walk({
      fs: this.fs,
      dir: `/${this.repo.full_name}`,
      trees: [git.TREE({ ref: commitHash1 }), git.TREE({ ref: commitHash2 })],
      map: async (filepath, [A, B]) => {
        // ignore directories
        if (filepath === '.') {
          return
        }
        if ((await A?.type()) === 'tree' || (await B?.type()) === 'tree') {
          return
        }

        // make sure it's a file we care about
        let match = false
        for (const filesPattern of filesWeCareAbout) {
          if (minimatch(`/${filepath}`, filesPattern)) {
            match = true
            break
          }
        }

        if (!match) {
          return
        }

        // generate ids
        const Aoid = A && (await A.oid())
        const Boid = B && (await B.oid())

        // determine modification type
        let type = 'equal'
        if (Aoid !== Boid) {
          type = 'modify'
        }
        if (!Aoid) {
          type = 'added'
        }
        if (!Boid) {
          type = 'removed'
        }
        if (Aoid === undefined && Boid === undefined) {
          console.log('Something weird happened:')
          console.log(A)
          console.log(B)
        }

        return {
          path: `/${filepath}`,
          type
        }
      }
    })
  }

  // git push from local filesystem
  async push (opts) {
    const o = {
      fs: this.fs,
      http,
      corsProxy: this.corsProxy,
      dir: `/${this.repo.full_name}`,
      ref: this.branch,
      url: this.getAuthUrl(),
      author: {
        name: this.user.name,
        email: this.user.email || this.user.login
      },
      ...opts
    }
    return git.push(o)
  }

  // git pull to local filesystem
  async pull (opts) {
    const o = {
      fs: this.fs,
      http,
      corsProxy: this.corsProxy,
      dir: `/${this.repo.full_name}`,
      ref: this.branch,
      singleBranch: true,
      url: this.getAuthUrl(),
      author: {
        name: this.user.name,
        email: this.user.email || this.user.login
      },
      ...opts
    }
    return git.pull(o)
  }

  // get a list of all files in local filesystem
  async allFiles (rootDir, existing = []) {
    rootDir = rootDir || `/${this.repo.full_name}`
    for (const file of await this.pfs.readdir(rootDir)) {
      if (file === '.git') {
        continue
      }
      const filename = `${rootDir}/${file}`
      const s = await this.pfs.lstat(filename)
      if (s.type === 'dir') {
        await this.allFiles(filename, existing)
      } else {
        existing.push({ filename })
      }
    }
    return existing
  }

  // get all the filenames that match a glob in local filesystem
  async glob (g) {
    return (await this.allFiles()).filter(f => minimatch(f.filename, `/${this.repo.full_name}${g}`)).map(f => f.filename.replace(`/${this.repo.full_name}`, ''))
  }

  // recursively makes a directory
  async mkdirp (dirname) {
    let prefix = `/${this.repo.full_name}`
    for (const directory of dirname.split('/')) {
      try {
        await this.pfs.mkdir(prefix + directory)
      } catch (error) {}
      prefix += directory + '/'
    }
  }

  // fill in any missing fields with reasonable defaults
  fixCollection (collection, name) {
    collection.name = name
    collection.files ||= `/content/${name}/**/*.mdx`
    collection.fields ||= []
    collection.title ||= titleize(name)

    for (const field of collection.fields) {
      if (!field.name) {
        console.error(`Fieldname note set in ${name} collection.`)
      } else {
        field.label ||= titleize(field.name)
      }
    }

    const fieldNames = collection.fields.map(f => f.name)
    collection.titleField ||= fieldNames.includes('title') ? 'title' : 'filename'
    collection.contentField ||= fieldNames.includes('content') ? 'content' : ''

    if (!collection.filename) {
      if (collection.titleField === 'filename') {
        collection.filename = '/content/${collection.name}/${dateFormat(new Date())}-${uuid()}.mdx'
      } else {
        collection.filename = '/content/${collection.name}/${slugify(' + collection.titleField + ')}.mdx'
      }
    }
  }

  // parse all content in a collection (from local filesystem)
  // TODO: this needs to be cached based on git/dirty-files

  async parseCollection (collection, name) {
    if (!collection || !name) {
      console.error('You must set collectinon & and name.')
      return {}
    }
    await this.fixCollection(collection, name)

    const files = await this.glob(collection.files)
    const out = await Promise.all(files.map(async filename => {
      const raw = await this.read(filename, 'utf8')
      let { data, content } = frontmatter(raw)
      data = data || {}

      if (collection.contentField) {
        data[collection.contentField] = content
      }

      for (const field of collection.fields) {
        if (field.type === 'date') {
          field.format ||= 'yyyy-mm-dd'
        }

        if (data[field.name] instanceof Date) {
          data[field.name] = dateFormat(field.format, data[field.name])
        }
        // TODO: validate content
        field.defaultValue ||= ''
        if (field.name === collection.titleField && !field.defaultValue) {
          field.defaultValue = '${collection.title} Item'
        }
      }

      return {
        raw,
        filename,
        ...data
      }
    }))

    return out.reduce((a, c) => ({ ...a, [c.filename]: c }), {})
  }
}
