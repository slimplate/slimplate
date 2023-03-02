import { useState, useEffect } from 'react'
import { Button } from 'flowbite-react'

export function useUnsignedCloudinary ({ cloudName, uploadPreset, onError = () => {}, onSuccess = () => {}, ...settings }) {
  const [widget, setWidget] = useState()
  useEffect(() => {
    setWidget(
      window.cloudinary.createUploadWidget({
        cloudName,
        uploadPreset,
        ...settings
      }, (err, res) => {
        if (err) {
          return onError(err)
        } else if (res.event === 'success') {
          return onSuccess(res.info)
        }
      }))
  }, [cloudName, uploadPreset])
  return widget
}

export function ButtonUnsignedUpload ({ cloudName, uploadPreset, onChange, onError, children = 'Upload', title = 'Upload Image', ...config }) {
  const cloudinary = useUnsignedCloudinary({ cloudName, uploadPreset, onSuccess: info => onChange(info.url), onError })

  const onClick = () => {
    cloudinary.open()
  }

  return (
    <div className='mt-4'>
      <Button onClick={onClick}>{children}</Button>
    </div>
  )
}
