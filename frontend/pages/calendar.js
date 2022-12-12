/** Inspired by and used from
 * https://jquense.github.io/react-big-calendar/examples/index.html?path=/docs/about-big-calendar--page
 **/

import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { CircularProgress, Button } from '@mui/material';
import EventDetailsModal from '../components/EventDetailsModal';
import CreateEventModal from '../components/CreateEventModal';
import moment from 'moment';
import 'moment-timezone'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'
import styles from '../styles/Calendar.module.css'
import "react-big-calendar/lib/css/react-big-calendar.css";

const BASE_URL = 'https://gsk-final-project-api.herokuapp.com/api/';
const API = axios.create({ baseURL: BASE_URL });
const userID = "63952f07f77a950017fe9466";

moment.tz.setDefault('America/Chicago');
const localizer = momentLocalizer(moment);

export default function Calendar() {
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState(null);
  const [home, setHome] = useState(null);
  const [user, setUser] = useState(null);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [activeEventDetails, setActiveEventDetails] = useState(null);
  const [reload, setReload] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await API.get(`users/${userID}`);
      if (res) {
        let data = res.data.data;
        let userColor = data.color;
        let homeID = data.home;

        setUser(data);
        // console.log(user)

        // get home data
        API.get(`homes/${homeID}`)
          .then(response => {
            setHome(response.data.data);
          })
          .catch(error => console.error(error));

        // get upcoming user events
        let upcomingEvents = [];
        const eventsRequests = data.events.map(id => API.get(`events/${id}`));
        const eventsResults = await Promise.all(eventsRequests);
        eventsResults.map(res => {
          let curEvent = res.data.data;
          let eventData = {
            id: curEvent._id,
            title: curEvent.name,
            home: curEvent.home,
            start: new Date(curEvent.start),
            end: new Date(curEvent.end),
            location: curEvent.location,
            guests: curEvent.guests,
            notes: curEvent.notes,
            repeat: curEvent.repeat,
            color: userColor || '#9CAF88'
          }
          upcomingEvents.push(eventData)
        })

        // get home events
        if (home && home.events.length > 0) {
          const homeRequests = home.events.map(id => API.get(`events/${id}`));
          const homeResults = await Promise.all(homeRequests);
          homeResults.map(res => {
            let curEvent = res.data.data;
            let eventData = {
              id: curEvent._id,
              title: curEvent.name,
              home: curEvent.home,
              start: new Date(curEvent.start),
              end: new Date(curEvent.end),
              location: curEvent.location,
              guests: curEvent.guests,
              notes: curEvent.notes,
              repeat: curEvent.repeat,
              color: '#9CAF88'
            }

            // avoid adding Home events that are also one of the logged in
            // User's events to the calendar
            const IDs = upcomingEvents.map(event => event.id);
            if (IDs.indexOf(eventData.id) === -1) {
              upcomingEvents.push(eventData);
            }
          })
        }

        setEvents(upcomingEvents);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchData();
  }, [reload]);

  const openEventDetailModal = (event) => {
    setActiveEventDetails(event)
    setShowEventDetailModal(true);
  }

  const closeEventDetailModal = () => {
    setShowEventDetailModal(false);
  }

  const openCreateEventModal = () => {
    setShowCreateEventModal(true);
  }

  const closeCreateEventModal = () => {
    setShowCreateEventModal(false);
  }

  const handleEventDetailFormSubmit = async data => {
    try {
      if (data && activeEventDetails) {
        console.log(data)
        let params = {
          name: data.title,
          home: data.home,
          start: new Date(data.start),
          end: new Date(data.end),
          location: data.location,
          guests: data.guests,
          notes: data.notes,
          repeat: data.repeat
        }
        const res = await API.put(`events/${activeEventDetails.id}`, params);
        setReload(!reload);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleEventDetailFormDelete = async data => {
    try {
      if (data && activeEventDetails) {
        const res = await API.delete(`events/${activeEventDetails.id}`);
        setReload(!reload);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleCreateEvent = async data => {
    try {
      if (data) {
        console.log(data)
        console.log("test")
        let params = {
          name: data.title,
          home: home._id,
          start: new Date(data.start),
          end: new Date(data.end),
          location: data.location,
          guests: data.guests,
          notes: data.notes,
          repeat: data.repeat,
          host: user._id,
          hostName: user.name
        }
        const res = await API.post('events', params);
        setReload(!reload);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const getEventStyle = (event) => {
    return {
      style: {
        display: 'flex',
        height: '20px',
        fontSize: '10px',
        alignItems: 'center',
        backgroundColor: event.color,
        borderColor: event.color,
      },
    };
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.pageContent}>
        {events && !isLoading ?
          <div className={styles.column}>
            <BigCalendar
              localizer={localizer}
              defaultDate={new Date()}
              defaultView="month"
              events={events}
              onSelectEvent={openEventDetailModal}
              eventPropGetter={getEventStyle}
              style={{ height: "calc(90vh - 150px)", width: "90vw", }}
              popup
            />
            {showEventDetailModal &&
              <EventDetailsModal
                handleSubmit={handleEventDetailFormSubmit}
                closeModal={closeEventDetailModal}
                eventData={activeEventDetails}
                handleDelete={handleEventDetailFormDelete}
              />}

            {showCreateEventModal &&
              <CreateEventModal
                handleCreate={handleCreateEvent}
                closeModal={closeCreateEventModal}
              />}
            <div className={styles.row}>
              <Button onClick={openCreateEventModal} variant='contained'>Create Event</Button>
            </div>
          </div>
          : <CircularProgress />}
      </div>
    </div>
  )
}