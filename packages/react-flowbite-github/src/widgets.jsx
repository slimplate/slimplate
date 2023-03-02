import { useState, useEffect } from 'react'
import cx from 'classnames'
import { tt, dateFormat } from '@slimplate/utils'
import { Lock } from 'tabler-icons-react'
import WidgetRichtext from './WidgetRichtext'

function inputClass (disabled, className) {
  return cx(className, { 'dark:text-gray-500 cursor-not-allowed': disabled }, 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500')
}

export function WidgetGeneric ({ Input = 'input', validators, value, onChange, name, label, className, defaultValue, isNew, article, project, collection, ...props }) {
  const [dirty, setDirty] = useState(!isNew)
  const required = validators?.includes('required')
  const disabled = validators?.includes('readonly')

  useEffect(() => {
    setDirty(!isNew)
  }, [isNew])

  const handleChange = e => {
    onChange(e.target.value)
    setDirty(true)
  }

  if (!dirty && isNew) {
    value = tt(defaultValue, { field: { ...props, value, name, label }, isNew, ...article, validators, project, collection })
  }

  return (
    <>
      <label htmlFor={name} className='block mb-2 text-sm font-medium text-gray-900 dark:text-white flex'>{label} {disabled && <Lock className='ml-2' size='16' />}</label>
      <Input
        required={required}
        disabled={disabled}
        id={name}
        name={name}
        type='text'
        value={value}
        onChange={handleChange}
        className={className}
        {...props}
      />
    </>
  )
}

export function date ({ onChange, format, ...props }) {
  const handleChange = value => {
    dateFormat(format, value)
    onChange(value)
  }
  return <WidgetGeneric {...props} onChange={handleChange} className={inputClass(props.disabled, props.className)} type='date' />
}

export function color ({ className, defaultValue, ...props }) {
  return <WidgetGeneric className={cx(className)} {...props} type='color' defaultValue={defaultValue || '#FFFFFF'} />
}

export const string = props => <WidgetGeneric {...props} className={inputClass(props.disabled, props.className)} />
export const number = props => <WidgetGeneric {...props} type='number' className={inputClass(props.disabled, props.className)} />
export const richtext = props => <WidgetRichtext {...props} Input='textarea' className={inputClass(props.disabled, props.className)} />
