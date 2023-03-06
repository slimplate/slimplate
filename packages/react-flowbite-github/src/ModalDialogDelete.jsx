import { Modal, Button } from 'flowbite-react'

export default function ModalDialogDelete ({ onConfirm, onClose, text, show }) {
  return (
    <Modal show={show} size='md' popup onClose={onClose}>
      <Modal.Header className='dark:bg-gray-800' />
      <Modal.Body className='dark:bg-gray-800'>
        <div className='text-center'>
          <h3 className='mb-5 text-lg font-normal text-gray-500 dark:text-gray-400'>
            {text}
          </h3>
          <div className='flex justify-center gap-4'>

            <Button
              color='gray'
              onClick={onClose}
            >
              No, cancel
            </Button>
            <Button
              color='failure'
              onClick={onConfirm}
            >
              Yes, I'm sure
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}
