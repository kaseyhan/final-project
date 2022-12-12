import { useState, useEffect } from "react"
import { RxCross1 } from 'react-icons/rx'
import { TextField, IconButton, Button, Typography, Card, Icon } from '@mui/material';
import styles from '../styles/EventDetailsModal.module.css'

const minute = 1000 * 60;
const hour = minute * 60;
const day = hour * 24;
const year = day * 365;

const FormItem = ({ title, defaultValue, numRows, id, type }) => {
  console.log(defaultValue)
  return (
    <div>
      <h3 className={styles.formHeader}>{title}</h3>
      <TextField
        id={id}
        multiline={numRows > 1}
        rows={numRows}
        defaultValue={defaultValue ? defaultValue : ""}
        // onChange={handleInput}
        style={{ width: '100%' }}
        inputProps={{ style: { fontSize: '14px' } }}
        type={type ? type : null}
        fullWidth
      />
    </div>
  )
}

export default function EventDetailsModal({ handleSubmit, closeModal, eventData }) {
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
        <h1 className={styles.title}>Event Details</h1>
        <div className={styles.formContainer}>
          <div className={styles.row}>
            <FormItem title="Title" defaultValue={eventData.title} numRows={1} id="title" />
            <FormItem title="Location" defaultValue={eventData.location} numRows={1} id="title" />
          </div>
          <div className={styles.row}>
            <FormItem title="Date" defaultValue={eventData.start.toLocaleDateString('en-CA')} numRows={1} id="date" type="date" />
            <FormItem title="Time" defaultValue={eventData.start.toLocaleTimeString('en-US', { hour12: false })} numRows={1} id="title" type="time" />
          </div>
          <div className={styles.row}>
            <FormItem title="Guests" defaultValue={eventData.guests.length > 0 ? eventData.guests.join(', ') : ""} numRows={3} id="title" />
            <FormItem title="Notes" defaultValue={eventData.notes} numRows={3} id="title" />
          </div>
        </div>
        <div className={styles.row}>
          <Button onClick={handleSubmit} variant='contained' style={{ margin: 'auto' }}><Typography>Save Changes</Typography></Button>
          <Button onClick={handleSubmit} variant='contained' style={{ margin: 'auto' }}><Typography>Delete Event</Typography></Button>
        </div>
      </div>
    </div>
  )
}