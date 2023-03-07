// view for listing content of a particular collection-type
import { Button } from 'flowbite-react'
import { useSlimplate } from './react-github.jsx'
import { Trash, Plus } from 'tabler-icons-react'
import ModalDialogDelete from './ModalDialogDelete'
import GithubProject from '@slimplate/github-git'
import { useState } from 'react'
import { tt } from '@slimplate/utils'

const onSelectDefault = (article, collection, project) => { document.location = `/admin/${project.name}/${collection.name}${article.filename}` }

function ContentStatus ({ status }) {
  return (
    <>
      {status === 'equal' && (<div title='Contents are the same on remote' className='h-2.5 w-2.5 rounded-full mr-2 shrink-0 bg-green-500' />)}
      {status === 'modify' && (<div title='Contents have diverged from remote' className='h-2.5 w-2.5 rounded-full mr-2 shrink-0 bg-yellow-300' />)}
      {status === 'added' && (<div title='File added' className='h-2.5 w-2.5 rounded-full mr-2 shrink-0 bg-blue-500' />)}
      {status === 'removed' && (<div title='File removed' className='h-2.5 w-2.5 rounded-full mr-2 shrink-0 bg-red-500' />)}
    </>
  )
}

export default function AdminContent ({ onCreate, onDelete = () => {}, onSelect = onSelectDefault, projectName, collectionName }) {
  const { projects, setProjects, fs, token, user, corsProxy, status } = useSlimplate()
  const [contentToDelete, setContentToDelete] = useState()

  const project = projects[projectName]
  const collection = project.collections[collectionName]

  let itemTitle = collection?.fields?.find(f => f.name === collection?.titleField)

  if (itemTitle) {
    itemTitle = itemTitle.label
  } else {
    itemTitle = 'Filename'
  }

  const handleDeleteArticleDialog = (contentFilename) => {
    setContentToDelete(contentFilename)
  }

  const handleDeleteArticle = async () => {
    const p = { ...projects }
    const clone = { ...collection }

    delete clone.content[contentToDelete]
    p[projectName].collections[collectionName] = clone
    setProjects(p)

    const git = new GithubProject(fs, project, project.default_branch, token, user, undefined, corsProxy)

    // update local git to match filesyem
    await git.rm(contentToDelete)
    await git.commit('removed "' + contentToDelete + '" content.')

    onDelete(contentToDelete)
    setContentToDelete(false)
  }

  return (
    <>
      <ModalDialogDelete
        show={!!contentToDelete}
        onClose={() => setContentToDelete(false)}
        onConfirm={handleDeleteArticle}
        text='Are you sure you want to delete this article?'
      />

      <div className='relative overflow-x-auto shadow-md sm:rounded-lg'>
        <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
          <thead className='border-b border-gray-500 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
            <tr>
              <th scope='col' className='px-6 py-3 w-2' />

              <th scope='col' className='px-6 py-3 pl-2'>
                {tt(itemTitle, { collection })}
              </th>
              <th scope='col' className='px-6 py-3 w-[8rem]'>
                <Button className='ml-auto' onClick={onCreate}>
                  <Plus size='16' className='mr-2' /> New
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.values(collection?.content || {}).map((article, i) => (
              <tr key={i} className='dark:hover:bg-gray-700 bg-white border-b dark:bg-gray-800 dark:border-gray-700'>
                <td onClick={e => onSelect(article, collection, project)} className='hover:cursor-pointer px-6 py-4 w-0 pr-0'>
                  {status[projectName].files && (<ContentStatus status={status[projectName].files[article.filename]} showText={false} />)}
                </td>
                <th onClick={e => onSelect(article, collection, project)} scope='row' className='hover:cursor-pointer px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white pl-0'>
                  <div className='flex items-center text-center whitespace-nowrap font-medium text-gray-900 dark:text-white'>
                    <div className='pl-3 text-left text-base font-semibold'>
                      {article[collection.titleField]}
                    </div>
                  </div>
                </th>
                <td className='px-6 py-4'>
                  <Button size='xs' className='mr-2 dark:border-slate-400 dark:hover:text-neutral-300 dark:hover:bg-slate-800 dark:hover:border-neutral-300 dark:text-slate-400 dark:focus:border-slate-400 dark:focus:text-slate-400 dark:focus:ring-transparent' color='gray' onClick={() => handleDeleteArticleDialog(article.filename)}>
                    <Trash className='mr-2' size='16' />
                    {' '}Delete
                  </Button>
                </td>
              </tr>))}
          </tbody>
        </table>

      </div>
    </>
  )
}
