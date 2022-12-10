import { useState, useEffect } from "react"
import { RxCross1 } from 'react-icons/rx'
import { TextField, IconButton, Button, Typography, Card, Icon } from '@mui/material';
import styles from '../styles/AnnouncementModal.module.css'

export default function AnnouncementModal({ showModal, newAnnouncement, updateAnnouncementData, closeModal, handleInput }) {
  const [state, setState] = useState({
    showModal: showModal,
    newAnnouncement: newAnnouncement
  });

  // const handleInput = event => {
  //   setData(event.target.value)
  // }

  const handleSubmit = event => {
    event.preventDefault();
    updateAnnouncementData(state.newAnnouncement);
    closeModal();
  }

  return (
    <div className={styles.dimBackground}>
      <div className={styles.modalContainer}>
        <IconButton onClick={closeModal} style={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: 10
        }}>
          <RxCross1 />
        </IconButton>
        <h1 className={styles.title}>Create Announcement</h1>
        <div className={styles.messageContainer}>
          <h3 className={styles.messageHeader}>Message</h3>
          <TextField
            id="announcement-details"
            multiline
            rows={5}
            defaultValue=""
            onChange={handleInput}
            style={{width: '100%'}}
          />
        </div>
        <Button onClick={handleSubmit} variant='contained' style={{margin: 'auto'}}><Typography>Post Announcement</Typography></Button>
      </div>
    </div>
  )
}