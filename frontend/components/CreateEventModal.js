import { useState, useEffect } from "react"
import { RxCross1 } from 'react-icons/rx'
import {
  TextField,
  IconButton,
  Button,
  Typography,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import moment from "moment";
import styles from '../styles/EventDetailsModal.module.css'

const FormItem = ({ title, defaultValue, numRows, id, type, handleFormChange, required }) => {
  const [repeatLabel, setRepeatLabel] = useState(defaultValue);

  const handleSelect = (event, id) => {
    setRepeatLabel(event.target.value);
    handleFormChange(event, id);
  }

  return (
    <div>
      <h3 className={styles.formHeader}>{title} {required ? '*' : ''}</h3>
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
            <MenuItem value={'biweekly'}>Bi-Weekly</MenuItem>
            <MenuItem value={'monthly'}>Monthly</MenuItem>
          </Select>
        </FormControl>
        :
        <FormControl>
          <TextField
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
        </FormControl>
      }
    </div>
  )
}

export default function CreateEventModal({ handleCreate, closeModal }) {
  const [newEventDetails, setNewEventDetails] = useState({
    title: '',
    home: '',
    start: null,
    end: null,
    location: '',
    guests: [],
    notes: '',
    repeat: 'none',
  })
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const handleFormChange = (event, param) => {
    if (param === 'date') {
      let newDate = new Date(event.target.value);
      let time = newEventDetails.time
        ? newEventDetails.time
        : newDate.toLocaleTimeString('en-US', { hour12: false });

      let newStartDate = new Date(`${event.target.value} ${time}`);
      let newEndDate = new Date(newStartDate.getTime() + 60 * 60 * 1000);

      setNewEventDetails(newEventDetails => ({
        ...newEventDetails,
        start: newStartDate,
        end: newEndDate
      }));
    } else if (param === 'time') {
      let parts = event.target.value.split(':'); // HH:MM:SS

      let s = parts[2] ? parts[2] : 0;
      let newStartDate = new Date(newEventDetails.start);
      newStartDate.setHours(parts[0], parts[1], s);

      let newEndDate = new Date(newEventDetails.end);
      newEndDate.setHours(parts[0], parts[1], s);

      setNewEventDetails(newEventDetails => ({
        ...newEventDetails,
        start: newStartDate,
        end: newEndDate
      }));
    } else {
      setNewEventDetails(newEventDetails => ({
        ...newEventDetails,
        [param]: event.target.value
      }));
    }
  }

  const handleCreateEvent = data => {
    // data validation
    if (!data.title || !data.start || !data.end) {
      console.log(data)
      setIsValid(false);
    } else {
      setIsLoading(true);
      handleCreate(data);
      setIsLoading(false);
      closeModal()
    }
  }

  return (
    <div className={styles.dimBackground}>
      {isLoading
        ? <CircularProgress />
        : <div className={styles.modalContainer}>
          <IconButton onClick={closeModal} style={{
            position: 'absolute',
            top: 0,
            right: 0,
            padding: 10
          }}>
            <RxCross1 />
          </IconButton>
          <h1 className={styles.title}>Create Event</h1>
          <div className={styles.formContainer}>
            <div className={styles.row}>
              <FormItem
                title="Title"
                numRows={1}
                id="title"
                handleFormChange={handleFormChange}
                required
              />
              <FormItem
                title="Location"
                numRows={1}
                id="location"
                handleFormChange={handleFormChange}
              />
            </div>
            <div className={styles.row}>
              <FormItem
                title="Date"
                numRows={1}
                id="date"
                type="date"
                handleFormChange={handleFormChange}
                required
              // defaultValue={moment().format("YYYY/MM/DD").replaceAll('/', '-')}
              />
              <FormItem
                title="Time"
                numRows={1}
                id="time"
                type="time"
                handleFormChange={handleFormChange}
                required
              // defaultValue={moment().format("HH:mm:ss")}
              />
            </div>
            <div className={styles.row}>
              <FormItem
                title="Guests"
                numRows={4}
                id="guests"
                handleFormChange={handleFormChange}
              />
              <FormItem
                title="Notes"
                numRows={4}
                id="notes"
                handleFormChange={handleFormChange}
              />
            </div>
            <div className={styles.row}>
              <FormItem
                title="Repeat"
                numRows={1}
                id="repeat"
                handleFormChange={handleFormChange}
                defaultValue="none"
              />
            </div>
          </div>
          <div className={styles.row} style={{ paddingTop: '35px', width: '60%' }}>
            <Button onClick={() => handleCreateEvent(newEventDetails)} color='success' variant='contained' style={{ margin: 'auto' }}>
              <Typography>Create Event</Typography>
            </Button>
          </div>
          <Fade in={!isValid}>
            <Alert
              onClose={() => { setIsValid(true) }}
              style={{ margin: 5 }}
              variant="filled"
              severity="error"
            >
              Title, Date, and Time must be filled out to create an event.
            </Alert>
          </Fade>
        </div>
      }
    </div>
  )
}