import { useState, useEffect } from "react"
import { RxCross1 } from 'react-icons/rx'
import { FaRegTrashAlt, FaRegSave } from 'react-icons/fa'
import {
  TextField,
  IconButton,
  Button,
  Typography,
  FormControl,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import styles from '../styles/EventDetailsModal.module.css'

const FormItem = ({ title, defaultValue, numRows, id, type, handleFormChange }) => {
  const [repeatLabel, setRepeatLabel] = useState(defaultValue);

  const handleSelect = (event, id) => {
    setRepeatLabel(event.target.value);
    handleFormChange(event, id);
  }

  return (
    <div>
      <h3 className={styles.formHeader}>{title}</h3>
      {id === 'repeat'
        ? <FormControl fullWidth>
          <Select
            id={id}
            value={repeatLabel}
            label="Repeat"
            onChange={event => handleSelect(event, id)}
            inputProps={{ 'aria-label': 'Without label' }}
            fullWidth
            style={{ width: '10vw' }}
          >
            <MenuItem value={'none'}>None</MenuItem>
            <MenuItem value={'daily'}>Daily</MenuItem>
            <MenuItem value={'weekly'}>Weekly</MenuItem>
            <MenuItem value={'monthly'}>Monthly</MenuItem>
          </Select>
        </FormControl>
        : <TextField
          placeholder={title}
          id={id}
          multiline={numRows > 1}
          rows={numRows}
          defaultValue={defaultValue ? defaultValue : ""}
          onChange={event => handleFormChange(event, id)}
          style={{ width: '17vw' }}
          inputProps={{ style: { fontSize: '14px' } }}
          type={type ? type : null}
          fullWidth
          disabled={id === 'guests'}
        />
      }
    </div>
  )
}

// const ConfirmationModal = () => {
//   return (
//     <div
//       className={styles.modalContainer}
//       style={{ 
//         zIndex: 20, 
//         backgroundColor: 'white',
//         position: 'absolute' 
//       }}>
//       TETETETETE
//     </div>
//   )
// }

export default function EventDetailsModal({ handleSubmit, closeModal, eventData, handleDelete }) {
  const [newEventDetails, setNewEventDetails] = useState({
    title: eventData.title,
    home: eventData.home,
    start: eventData.start,
    end: eventData.end,
    location: eventData.location,
    guests: eventData.guests,
    notes: eventData.notes,
    repeat: eventData.repeat,
    color: eventData.color
  });
  const [isLoading, setIsLoading] = useState(false);
  // const [showConfirmationModal, setShowConfirmationModal] = useState(false);


  const handleFormChange = (event, param) => {
    if (param === 'startDate') {
      let oldTime = newEventDetails.start.toLocaleTimeString('en-US', { hour12: false });

      let newStartDate = new Date(`${event.target.value} ${oldTime}`);
      // let newEndDate = new Date(newStartDate.getTime() + 60 * 60 * 1000);

      setNewEventDetails(newEventDetails => ({
        ...newEventDetails,
        start: newStartDate//,
        // end: newEndDate
      }));
    } else if (param === 'endDate') {
      let oldTime = newEventDetails.start.toLocaleTimeString('en-US', { hour12: false });

      // let newStartDate = new Date(`${event.target.value} ${oldTime}`);
      let newEndDate = new Date(`${event.target.value} ${oldTime}`);

      setNewEventDetails(newEventDetails => ({
        ...newEventDetails,
        // start: newStartDate,
        end: newEndDate
      }));
    } else if (param === 'startTime') {
      let parts = event.target.value.split(':'); // HH:MM:SS

      let s = parts[2] ? parts[2] : 0;
      let newStartDate = new Date(newEventDetails.start);
      newStartDate.setHours(parts[0], parts[1], s);

      // let newEndDate = new Date(newEventDetails.end);
      // newEndDate.setHours(parts[0], parts[1], parts[2]);

      setNewEventDetails(newEventDetails => ({
        ...newEventDetails,
        start: newStartDate//,
        // end: newEndDate
      }));
    } else if (param === 'endTime') {
      let parts = event.target.value.split(':'); // HH:MM:SS

      // let newStartDate = new Date(newEventDetails.start);
      // newStartDate.setHours(parts[0], parts[1], parts[2]);

      let s = parts[2] ? parts[2] : 0;
      let newEndDate = new Date(newEventDetails.end);
      newEndDate.setHours(parts[0], parts[1], s);

      setNewEventDetails(newEventDetails => ({
        ...newEventDetails,
        // start: newStartDate,
        end: newEndDate
      }));
    } else {
      setNewEventDetails(newEventDetails => ({
        ...newEventDetails,
        [param]: event.target.value
      }));
    }
  }

  const handleSubmitEvent = data => {
    setIsLoading(true);
    handleSubmit(data);
    setIsLoading(false);
    closeModal()
  }

  const handleDeleteEvent = data => {
    setIsLoading(true);
    handleDelete(data);
    setIsLoading(false);
    closeModal()
  }

  return (
    <div className={styles.dimBackground}>
      {isLoading
        ? <CircularProgress />
        : <div
          className={styles.modalContainer}
          style={{
            // backgroundColor: showConfirmationModal ? 'rgba(0, 0, 0, 0.3)' : '',
          }}>
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
              <FormItem
                title="Title"
                defaultValue={eventData.title}
                numRows={1}
                id="title"
                handleFormChange={handleFormChange}
              />
              <FormItem
                title="Location"
                defaultValue={eventData.location}
                numRows={1}
                id="location"
                handleFormChange={handleFormChange}
              />
            </div>
            <div className={styles.row}>
              <FormItem
                title="Start date"
                defaultValue={eventData.start.toLocaleDateString('en-CA')}
                numRows={1}
                id="startDate"
                type="date"
                handleFormChange={handleFormChange}
              />
              <FormItem
                title="End date"
                defaultValue={eventData.end.toLocaleDateString('en-CA')}
                numRows={1}
                id="endDate"
                type="date"
                handleFormChange={handleFormChange}
              />
            </div>
            <div className={styles.row}>
              <FormItem
                title="Start time"
                defaultValue={eventData.start.toLocaleTimeString('en-US', { hour12: false })}
                numRows={1}
                id="startTime"
                type="time"
                handleFormChange={handleFormChange}
              />
              <FormItem
                title="End time"
                defaultValue={eventData.end.toLocaleTimeString('en-US', { hour12: false })}
                numRows={1}
                id="endTime"
                type="time"
                handleFormChange={handleFormChange}
              />
            </div>
            <div className={styles.row}>
              <FormItem
                title="Guests"
                defaultValue={eventData.guests.length > 0 ? eventData.guests.join(', ') : ""}
                numRows={4}
                id="guests"
                handleFormChange={handleFormChange}
              />
              <FormItem
                title="Notes"
                defaultValue={eventData.notes}
                numRows={4}
                id="notes"
                handleFormChange={handleFormChange}
              />
            </div>
            <div className={styles.row}>
              <FormItem
                title="Repeat"
                defaultValue={eventData.repeat}
                numRows={1}
                id="repeat"
                handleFormChange={handleFormChange}
              />
            </div>
          </div>
          <div className={styles.row} style={{ paddingTop: '35px', width: '60%' }}>
            <Button onClick={() => handleDeleteEvent(newEventDetails)} variant='contained' color='error' style={{ margin: 'auto' }}>
              <Typography>Delete Event</Typography>
              <FaRegTrashAlt style={{ marginLeft: '10px' }} />
            </Button>
            <Button onClick={() => handleSubmitEvent(newEventDetails)} color='success' variant='contained' style={{ margin: 'auto' }}>
              <Typography>Save Changes</Typography>
              <FaRegSave style={{ marginLeft: '10px' }} />
            </Button>
          </div>
        </div>
      }
      {/* {showConfirmationModal && <ConfirmationModal />} */}
    </div>
  )
}