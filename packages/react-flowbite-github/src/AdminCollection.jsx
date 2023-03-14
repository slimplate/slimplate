// view for managing collection
import { tt } from '@slimplate/utils'
import ButtonPush from './ButtonPush'
import { CloudUpload } from 'tabler-icons-react'
import { useSlimplate } from './react-github.jsx'
import { CollectionStatus, ProjectStatus } from './status'

const defaultOnCollection = (collection, project) => { document.location = `/admin/${project.full_name}/${collection.name}` }

export default function AdminCollection ({ onSelect = defaultOnCollection, projectName, enableSync = false }) {
  const { projects, status } = useSlimplate()
  const project = projects[projectName]

  return (
    <>
      <div className='relative overflow-x-auto shadow-md sm:rounded-lg'>
        <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
          <thead className='p-2 border-b border-gray-500 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
            <tr>
              <th scope='col' className='pl-6 py-3'>
                {enableSync && status[projectName] && <ProjectStatus showText={false} updating={status[projectName].updating} commitsAhead={status[projectName].commitsAhead} />}
              </th>

              <th scope='col' className='px-6 py-6 pl-2'>
                Collections
              </th>

              {enableSync && (
                <th scope='col' className='px-6 py-3 pl-2'>
                  <ButtonPush
                    size='xs'
                    color='gray'
                    projectName={projectName}
                    title='sync local chnages with remote git (pull/push)'
                    className='dark:border-slate-400 dark:hover:text-neutral-300 dark:hover:bg-slate-800 dark:hover:border-neutral-300 dark:text-slate-400 dark:focus:border-slate-400 dark:focus:text-slate-400 dark:focus:ring-transparent ml-auto'
                  >
                    <CloudUpload className='mr-2' size='16' />
                    {' '}Sync
                  </ButtonPush>
                </th>
              )}

            </tr>
          </thead>
          <tbody>
            {Object.values(project?.collections || {}).map((c, i) => (
              <tr key={i} className='dark:hover:bg-gray-700 bg-white border-b dark:bg-gray-800 dark:border-gray-700'>
                <td onClick={e => onSelect(c, project)} className='hover:cursor-pointer px-6 py-4 w-0 pr-0'>
                  {status[projectName]?.collections && (<CollectionStatus status={status[projectName]?.collections[c.name]} />)}
                </td>
                <td onClick={() => onSelect(c, project)} scope='row' className='hover:cursor-pointer px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white pl-0'>
                  <div className='flex items-center text-center whitespace-nowrap font-medium text-gray-900 dark:text-white'>
                    <div className='pl-3'>
                      <div className='text-left text-base font-semibold' key={c.name}>{tt((c.title || ''), { collection: c })}</div>
                    </div>
                  </div>
                </td>
                {enableSync && <td />}
              </tr>))}
          </tbody>
        </table>
      </div>
    </>
  )
}
