import { Label, TextInput } from 'flowbite-react'

export default function FormEditButton ({ onChange, value }) {
  const handleChange = e => {
    const { name, ...el } = e.target
    const v = { ...value, [name]: el.value }
    onChange(v)
  }

  return (
    <div className='flex justify-evenly gap-4'>
      <div className='mb-2 block w-full'>
        <Label value='Button Text' />
        <TextInput
          type='text'
          name='text'
          className='mt-2'
          value={value?.text || ''}
          onChange={handleChange}
          placeholder='Cool Button'
          required
        />
      </div>

      <div className='mb-2 block w-full'>
        <Label value='URL' />
        <TextInput
          type='text'
          name='url'
          className='mt-2'
          value={value?.url || ''}
          onChange={handleChange}
          placeholder='URL'
          required
        />
      </div>
    </div>
  )
}
