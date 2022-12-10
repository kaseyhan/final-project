import Head from 'next/head'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import { FaPlus } from 'react-icons/fa'
import { Checkbox, Card, Typography, CircularProgress, IconButton } from '@mui/material'
import { useState, useEffect } from 'react'
import axios from 'axios'
import styles from '../styles/Home.module.css'
import { FaCreativeCommonsSamplingPlus } from 'react-icons/fa'
import AnnouncementModal from '../components/AnnouncementModal'

const BASE_URL = 'https://gsk-final-project-api.herokuapp.com/api/';
const API = axios.create({ baseURL: BASE_URL });

export default function Home() {
  const tasks = [
    {
      'id': '1',
      'title': 'Clean the dishes'
    },
    {
      'id': '2',
      'title': 'Take out the trash'
    },
  ]

  const announcements = [
    {
      'id': '1',
      'title': 'I baked cookies! Help yourself!'
    },
    {
      'id': '2',
      'title': 'Make sure to lock the door when you leave!'
    },
  ]

  const upcomingEvents = [
    {
      'id': '1',
      'title': 'Dinner'
    },
    {
      'id': '2',
      'title': 'Bar Crawl'
    },
    {
      'id': '3',
      'title': 'Dinner'
    },
    {
      'id': '4',
      'title': 'Bar Crawl'
    },

  ]

  const ItemCard = ({ title, isTask }) => {
    return (
      <Card sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        padding: '0 5px',
        margin: 0,
        width: '100%',
        border: '2px black solid'
      }}>
        <p>{title}</p>
        {isTask && <Checkbox />}
      </Card>
    );
  };

  const [toDoData, setToDoData] = useState(null);
  const [announcementsData, setAnnouncementsData] = useState(null);
  const [eventsData, setEventsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [newAnnouncement, setNewAnnouncement] = useState('');

  const fetchData = async () => {
    try {
      // const res = await API.get('users');
      // console.log(res.data.data);
      // axios.get('/api/endpoint1')
      //   .then(response => setToDoData(response.data))
      //   .catch(error => console.error(error));

      // axios.get('/api/endpoint2')
      //   .then(response => setAnnouncementsData(response.data))
      //   .catch(error => console.error(error));

      // axios.get('/api/endpoint2')
      //   .then(response => setEventsData(response.data))
      //   .catch(error => console.error(error));
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    setIsLoading(true);

    fetchData();

    setToDoData(tasks);
    setAnnouncementsData(announcements);
    setEventsData(upcomingEvents);
    setIsLoading(false);
    console.log(newAnnouncement)
  }, []);

  const openModal = () => {
    setShowModal(true);
  }

  const closeModal = () => {
    setShowModal(false);
  }

  const handleInput = event => {
    setNewAnnouncement(event.target.value)
  }

  const updateAnnouncementData = data => {
    console.log(data)
    setNewAnnouncement(data);
    let newAnnouncementData = {'id': 3, 'title':newAnnouncement}
    setAnnouncementsData([...announcementsData, newAnnouncementData]);
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.pageContent}>
        <div className={styles.welcomeSign}>
          Welcome, Name
        </div>

        {isLoading ? <CircularProgress style={{ marginTop: '100px' }} /> :
          <div className={styles.dashboard}>
            <div className={styles.left}>
              <div className={styles.toDoContainer}>
                <Typography style={{ fontSize: '36px' }}>Your To-Do's</Typography>
                <div className={styles.list}>
                  <div className={styles.listContent}>
                    {(toDoData && toDoData.length > 0) ? (toDoData.map((task) => (
                      <ItemCard key={task.id} title={task.title} isTask />
                    ))) : <h3>No Tasks...</h3>}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.right}>
              <div className={styles.announcementsContainer}>
                <Typography style={{ fontSize: '24px' }}>Announcements</Typography>
                <IconButton onClick={openModal} style={{ position: 'absolute', top: 0, right: 0, padding: 0, margin: '7px' }}>
                  <FaPlus size={25} />
                </IconButton>

                {showModal && (
                  <AnnouncementModal
                    showModal={showModal}
                    newAnnouncement={newAnnouncement}
                    updateAnnouncementData={updateAnnouncementData}
                    closeModal={closeModal}
                    handleInput={handleInput}
                  />
                )}

                <div className={styles.list}>
                  <div className={styles.listContent}>
                    {(announcementsData && announcementsData.length > 0) ? (announcementsData.map((announcement) => (
                      <ItemCard key={announcement.id} title={announcement.title} />
                    ))) : <h3>No Announcements...</h3>}
                  </div>
                </div>
              </div>

              <div className={styles.eventsContainer}>
                <Typography style={{ fontSize: '24px' }}>Upcoming Events</Typography>
                <div className={styles.list}>
                  <div className={styles.listContent}>
                    {(eventsData && eventsData.length > 0) ? (eventsData.map((event) => (
                      <ItemCard key={event.id} title={event.title} />
                    ))) : <h3>No Upcoming Events...</h3>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div >
  )
}
