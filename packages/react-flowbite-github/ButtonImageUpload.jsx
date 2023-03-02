import { useState } from 'react'
import { CloudUpload } from 'tabler-icons-react'
import { ButtonUnsignedUpload } from '@slimplate/react-flowbite-cloudinary'

export default function ButtonImageUpload () {
  const [demoImage, setDemoImage] = useState()
  const { VITE_CLOUDINARY_NAME, VITE_CLOUDINARY_PRESET } = import.meta.env

  return (
    <>
      <ButtonUnsignedUpload cloudName={VITE_CLOUDINARY_NAME} uploadPreset={VITE_CLOUDINARY_PRESET} onChange={setDemoImage}>
        <CloudUpload className='mr-2' size='16' /> Upload Image
      </ButtonUnsignedUpload>
      {demoImage && <img className='mt-4' width={200} src={demoImage} alt='' />}
    </>
  )
}
