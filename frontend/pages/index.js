import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { FaPlus } from 'react-icons/fa'
import { Checkbox, Card, Typography, CircularProgress, IconButton } from '@mui/material'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaCreativeCommonsSamplingPlus } from 'react-icons/fa'
import AnnouncementModal from '../components/AnnouncementModal'
import styles from '../styles/Home.module.css'

const BASE_URL = 'https://gsk-final-project-api.herokuapp.com/api/';
const API = axios.create({ baseURL: BASE_URL });

// cite: https://css-tricks.com/converting-color-spaces-in-javascript/
function hexToRGB(h) {
  let r = 0, g = 0, b = 0;
  // 3 digits
  if (h.length == 4) {
    r = "0x" + h[1] + h[1];
    g = "0x" + h[2] + h[2];
    b = "0x" + h[3] + h[3];

    // 6 digits
  } else if (h.length == 7) {
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
  }

  return "rgba(" + +r + "," + +g + "," + +b + ", 0.8)";
}

const ItemCard = ({ id, title, color, isTask, isClickable }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCompleteTask = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    let res = await API.get(`/tasks/${id}`);
    let taskData = res.data.data;
    // console.log(taskData)

    setIsChecked(!isChecked)
    // setIsChecked(true)
  }

  const handleItemCardClick = (event, id) => {
    console.log(id)
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <Card onClick={isClickable ? event => handleItemCardClick(event, id) : null} sx={{
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'row',
      padding: '0 5px',
      margin: 0,
      width: '100%',
      border: '2px black solid',
      cursor: isClickable ? 'pointer' : 'default',
      pointerEvents: 'auto',
      backgroundColor: color ? hexToRGB(color) : 'white',
    }}>
      <p>{title}</p>
      {isTask && <Checkbox checked={isChecked} onClick={handleCompleteTask} />}
    </Card>
  );
};

export default function Home() {
  // const userID = "63952f07f77a950017fe9466";
  const router = useRouter();

  const [toDoData, setToDoData] = useState(null);
  const [announcementsData, setAnnouncementsData] = useState(null);
  const [eventsData, setEventsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [homeData, setHomeData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [userID, setUserID] = useState(window.sessionStorage.getItem("userID"));

  const fetchData = async () => {
    try {
      // console.log(window.sessionStorage.getItem("userID"))
      // console.log("userID");
      console.log(userID);
      
      const res = await API.get(`users/${userID}`);
      if (res) {
        let data = res.data.data;
        let homeID = data.home;

        setUserData(data);

        // get announcements
        API.get(`homes/${homeID}`)
          .then(response => {
            setAnnouncementsData(response.data.data.announcements);
            setHomeData(response.data.data);
          })
          .catch(error => console.error(error));

        // get to-do tasks
        let toDoTasks = [];
        const tasksRequests = data.pendingTasks.map(id => API.get(`tasks/${id}`));
        const tasksResults = await Promise.all(tasksRequests);
        tasksResults.forEach(res => {
          toDoTasks.push(res.data.data);
        })
        setToDoData(toDoTasks);

        // get upcoming events
        let upcomingEvents = [];
        const eventsRequests = data.events.map(id => API.get(`events/${id}`));
        const eventsResults = await Promise.all(eventsRequests);
        eventsResults.forEach(res => {
          upcomingEvents.push(res.data.data);
        })
        setEventsData(upcomingEvents);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const userID = window.sessionStorage.getItem("userID");
    console.log(userID);
    if (userID == null || userID == "undefined") {
      // router.push("/login")
    } else {
      setUserID(userID);
      setIsLoading(true);
      fetchData();
      setIsLoading(false);
    }
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

  const handleSubmit = (data) => {
    setIsLoading(true);

    setNewAnnouncement(data)
    let updatedAnnouncements = [...announcementsData, newAnnouncement];
    let params = {
      "name": homeData.name,
      "password": homeData.password,
      "announcements": updatedAnnouncements
    }
    API.put(`homes/${homeData._id}`, params)
      .then(response => {
        setAnnouncementsData(updatedAnnouncements);
      })
      .catch(error => console.error(error));

    setIsLoading(false);
    closeModal();
  }

  const handleContainerClick = (event, href) => {
    router.push(href);
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.pageContent}>
        <div className={styles.welcomeSign} style={{
          backgroundColor: userData ? hexToRGB(userData.color) : 'white'
        }}>
          Welcome, {userData ? userData.name : 'User'}
        </div>

        {isLoading ? <CircularProgress style={{ marginTop: '100px' }} /> :
          <div className={styles.dashboard}>
            <div className={styles.left}>
              <div
                onClick={event => handleContainerClick(event, '/to-do')}
                className={styles.toDoContainer}
              >
                <Typography style={{ fontSize: '36px' }}>Your To-Do's</Typography>
                <div className={styles.list}>
                  <div className={styles.listContent}>
                    {(toDoData && toDoData.length > 0) ? (toDoData.map((task) => (
                      <ItemCard
                        key={task._id}
                        id={task._id}
                        title={task.name}
                        color={userData.color}
                        isTask
                        isClickable
                      />
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
                    handleSubmit={handleSubmit}
                    closeModal={closeModal}
                    handleInput={handleInput}
                  />
                )}

                <div className={styles.list}>
                  <div className={styles.listContent}>
                    {(announcementsData && announcementsData.length > 0) ? (announcementsData.map((announcement, idx) => (
                      <ItemCard
                        key={idx}
                        id={idx}
                        title={announcement}
                      />
                    ))) : <h3>No Announcements...</h3>}
                  </div>
                </div>
              </div>

              <div
                onClick={event => handleContainerClick(event, '/calendar')}
                className={styles.eventsContainer}
              >
                <Typography style={{ fontSize: '24px' }}>Upcoming Events</Typography>
                <div className={styles.list}>
                  <div className={styles.listContent}>
                    {(eventsData && eventsData.length > 0) ? (eventsData.map((event) => (
                      <ItemCard
                        key={event._id}
                        id={event._id}
                        title={event.name}
                        isClickable
                      />
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
