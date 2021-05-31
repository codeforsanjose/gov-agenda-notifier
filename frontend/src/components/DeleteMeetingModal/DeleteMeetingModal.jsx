import React, { useState } from 'react';
import Modal from 'react-modal';
import { useMutation } from '@apollo/client';
import './DeleteMeetingModal.scss';
import { toDateString, toTimeString } from '../../utils/timestampHelper';
import { CancelIcon } from '../../utils/_icons';
import { DELETE_MEETING } from '../../graphql/graphql';

import SuccessModal from '../SuccessModal/SuccessModal';
import Spinner from '../Spinner/Spinner';

/**
 * A modal to meeting deletion.
 * Use the custom 'useDeleteModal' hook when implementing deletion
 * on a page.
 *
 * props:
 *    isOpen
 *      Boolean state that indicates if the modal is shown
 *    closeModal
 *      Callback function to close the modal
 *    meetingId
 *      Number used to upload to specific meeting or create a new one if null
 *
 * state:
 *    deleteSuccessful
 *      Boolean indicating if success modal is shown
 */

function DeleteMeetingModal({ isOpen, closeModal, meetingId, startTime }) {
  const [deleteMeeting, { loading, error, data }] = useMutation(DELETE_MEETING);
  const [deleteSuccessful, setDeleteSuccessful] = useState(false);

  const date = toDateString(startTime);
  const time = toTimeString(startTime);

  function clearAndCloseModal() {
    setDeleteSuccessful(false);
    closeModal();
  }

  async function handleDelete() {
    try {
      await deleteMeeting({variables: { id: meetingId }});
      // delete from state
      setDeleteSuccessful(true);
    } catch (e) {
      console.error(e);
    }
  }

  Modal.setAppElement('#root');

  if (deleteSuccessful) {
    return (
      <SuccessModal
        isOpen={isOpen}
        closeModal={clearAndCloseModal}
        headerText="Meeting Successfully Deleted!"
        confirmModal={clearAndCloseModal}
        confirmText="Close"
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={clearAndCloseModal}
      contentLabel="Delete Meeting"
      className="DeleteMeetingModal"
      overlayClassName="modal-overlay"
    >
      <div className="wrapper">
        <button type="button" onClick={clearAndCloseModal} className="cancel-button close-modal">
          <CancelIcon />
        </button>

        <h2>Are you sure you want to delete this meeting?</h2>
        <p className="delete-meeting-info">{`${date} - ${time}`}</p>

        <div className="modal-buttons">
          <button
            type="button"
            className="delete-button modal-button"
            onClick={handleDelete}
          >
            {loading && <Spinner />}
            {loading ? 'Deleting' : 'Delete'}
          </button>

          <button
            type="button"
            className="modal-button"
            onClick={closeModal}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteMeetingModal;