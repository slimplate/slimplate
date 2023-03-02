// view for managing collection
import { useSlimplate } from '@slimplate/react-github'
import tt from 'template-templates'
import * as inflection from 'inflection'
import { uuid, slugify, dateFormat } from '@slimplate/utils'

function CollectionStatus ({ status }) {
  return (
    <div className='flex gap-1'>
      {status.length === 0 && (<div title='Contents are the same on remote' className='h-2.5 w-2.5 rounded-full mr-2 shrink-0 bg-green-500' />)}
      {status.includes('modify') && (<div title='Contents have diverged from remote' className='h-2.5 w-2.5 rounded-full mr-2 shrink-0 bg-yellow-300' />)}
      {status.includes('added') && (<div title='Files were added' className='h-2.5 w-2.5 rounded-full mr-2 shrink-0 bg-blue-500' />)}
      {status.includes('removed') && (<div title='Files were removed' className='h-2.5 w-2.5 rounded-full mr-2 shrink-0 bg-red-500' />)}
    </div>
  )
}

const defaultOnCollection = (collection, project) => { document.location = `/admin/${project.full_name}/${collection.name}` }

export default function AdminCollection ({ onSelect = defaultOnCollection, projectName }) {
  const { projects, status } = useSlimplate()
  const project = projects[projectName]

  return (
    <>
      <div className='relative overflow-x-auto shadow-md sm:rounded-lg'>
        <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
          <thead className='border-b border-gray-500 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
            <tr>
              <th scope='col' className='px-6 py-3 w-2' />

              <th scope='col' className='px-6 py-3 pl-2'>
                Collections
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.values(project?.collections || {}).map((c, i) => (
              <tr key={i} className='dark:hover:bg-gray-700 bg-white border-b dark:bg-gray-800 dark:border-gray-700'>
                <td onClick={e => onSelect(c, project)} className='hover:cursor-pointer px-6 py-4 w-0 pr-0'>
                  {status[projectName]?.collections && (<CollectionStatus status={status[projectName]?.collections[c.name]} />)}
                </td>
                <th onClick={() => onSelect(c, project)} scope='row' className='hover:cursor-pointer px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white pl-0'>
                  <div className='flex items-center text-center whitespace-nowrap font-medium text-gray-900 dark:text-white'>
                    <div className='pl-3'>
                      <div className='text-left text-base font-semibold' key={c.name}>{tt((c.title || ''), { uuid, slugify, ...inflection, dateFormat, collection: c })}</div>
                    </div>
                  </div>
                </th>
              </tr>))}
          </tbody>
        </table>
      </div>
    </>
  )
}
