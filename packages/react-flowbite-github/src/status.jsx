import { pluralize } from 'inflection'
import cx from 'classnames'
import { Spinner } from 'flowbite-react'
import { BoxAlignLeft, BoxAlignRight, Check } from 'tabler-icons-react'

export const CollectionStatus = ({ status }) => {
  return (
    <div className='flex gap-1'>
      {status.length === 0 && (<div title='Contents are the same on remote' className='h-2.5 w-2.5 rounded-full mr-2 shrink-0 bg-green-500' />)}
      {status.includes('modify') && (<div title='Contents have diverged from remote' className='h-2.5 w-2.5 rounded-full mr-2 shrink-0 bg-yellow-300' />)}
      {status.includes('added') && (<div title='Files were added' className='h-2.5 w-2.5 rounded-full mr-2 shrink-0 bg-blue-500' />)}
      {status.includes('removed') && (<div title='Files were removed' className='h-2.5 w-2.5 rounded-full mr-2 shrink-0 bg-red-500' />)}
    </div>
  )
}

export const ContentStatus = ({ status }) => {
  return (
    <>
      {status === 'equal' && (<div title='Contents are the same on remote' className='h-2.5 w-2.5 rounded-full mr-2 shrink-0 bg-green-500' />)}
      {status === 'modify' && (<div title='Contents have diverged from remote' className='h-2.5 w-2.5 rounded-full mr-2 shrink-0 bg-yellow-300' />)}
      {status === 'added' && (<div title='File added' className='h-2.5 w-2.5 rounded-full mr-2 shrink-0 bg-blue-500' />)}
      {status === 'removed' && (<div title='File removed' className='h-2.5 w-2.5 rounded-full mr-2 shrink-0 bg-red-500' />)}
    </>
  )
}

export const ProjectStatus = ({ updating, commitsAhead = 0, showText = true }) => {
  let title = 'You are synched up with the remote'

  if (updating) {
    title = 'Currently loading status'
  } else {
    if (commitsAhead > 0) {
      title = `You are ${pluralize('commit', Math.abs(commitsAhead), true)} ahead of the remote`
    } else if (commitsAhead < 0) {
      title = `You are ${pluralize('commit', Math.abs(commitsAhead), true)} behind of the remote`
    }
  }

  return (
    <div className={cx('flex items-center', { 'min-w-[8rem]': showText })} title={title}>
      <div>
        {updating && (
          <div className='flex items-center' title='Syncing with remote'>
            <Spinner className='mr-2 w-[16px]' />
            {showText && 'Loading'}
          </div>
        )}
        {!updating && commitsAhead === 0 && (
          <div className='flex items-center' title='You are up to date with remote'>
            <Check className='mr-2 dark:text-green-500' size='16' />
            {showText && 'Up to date'}

          </div>
        )}
        {!updating && commitsAhead > 0 && (
          <div className='flex items-center' title='You are ahead of remote, sync changes'>
            <BoxAlignRight className='mr-2 dark:text-yellow-300' size='16' />
            {showText && 'Local Changes'}
          </div>
        )}
        {!updating && commitsAhead < 0 && (
          <div className='flex items-center' title='You are behind remote, sync changes'>
            <BoxAlignLeft className='mr-2 dark:text-yellow-300' size='16' />
            {showText && 'Behind Remote'}
          </div>
        )}
      </div>
    </div>
  )
}
