/** Inspired by and used from
 * https://jquense.github.io/react-big-calendar/examples/index.html?path=/docs/about-big-calendar--page
 **/

import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { CircularProgress, Button } from '@mui/material';
import EventDetailsModal from '../components/EventDetailsModal';
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
  const [activeEventDetails, setActiveEventDetails] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await API.get(`users/${userID}`);
      if (res) {
        let data = res.data.data;
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
            start: new Date(curEvent.start),
            end: new Date(curEvent.end),
            location: curEvent.location,
            guests: curEvent.guests,
            notes: curEvent.notes,
            color: user ? user.color : '#9CAF88'
          }
          upcomingEvents.push(eventData)
        })

        // get home events
        if (home && home.events.length > 0) {
          console.log(home.events)
          const homeRequests = home.events.map(id => API.get(`events/${id}`));
          const homeResults = await Promise.all(homeRequests);
          homeResults.map(res => {
            let curEvent = res.data.data;
            let eventData = {
              id: curEvent._id,
              title: curEvent.name,
              start: new Date(curEvent.start),
              end: new Date(curEvent.end),
              location: curEvent.location,
              guests: curEvent.guests,
              notes: curEvent.notes,
              color: user ? user.color : '#9CAF88'
            }
            upcomingEvents.push(eventData)
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
  }, []);

  const openEventDetailModal = (event) => {
    console.log(event)
    setActiveEventDetails(event)
    setShowEventDetailModal(true);
  }

  const closeEventDetailModal = () => {
    setShowEventDetailModal(false);
  }

  const handleEventDetailFormSubmit = data => {
    setN(data)
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
              style={{ height: "calc(90vh - 150px)", width: "90vw" }}
              popup
            />
            {showEventDetailModal &&
              <EventDetailsModal
                handleSubmit={handleEventDetailFormSubmit}
                closeModal={closeEventDetailModal}
                eventData={activeEventDetails}
              />}
            <div className={styles.row}>
              <Button variant='contained'>Create Event</Button>
            </div>
          </div>
          : <CircularProgress />}
      </div>
    </div>
  )
}