import Head from 'next/head'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import { Checkbox, Card, Typography } from '@mui/material'

import styles from '../styles/Home.module.css'

export default function Home() {
  const tasks = [
    {
      'id': '1',
      'title': 'Do the dishes'
    },
    {
      'id': '2',
      'title': 'Take out the trash'
    },
    {
      'id': '3',
      'title': 'Get the mail'
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
  ]

  const ItemCard = ({ title, isTask }) => {
    return (
      <Card sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        padding: '0 5px',
        margin: 0,
        width: '100%'
      }}>
        <p>{title}</p>
        {isTask && <Checkbox />}
      </Card>
    );
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.pageContent}>
        <div className={styles.welcomeSign}>
          Welcome, Name
        </div>

        <div className={styles.dashboard}>
          <div className={styles.left}>
            <div className={styles.toDoContainer}>
              <Typography style={{ fontSize: '36px' }}>Your To-Do's</Typography>
              <div className={styles.list}>
                {tasks && (tasks.map((task) => (
                  <ItemCard key={task.id} title={task.title} isTask />
                )))}
              </div>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.announcementsContainer}>
              <Typography style={{ fontSize: '24px' }}>Announcements</Typography>
              <div className={styles.list}>
                {announcements && (announcements.map((announcement) => (
                  <ItemCard key={announcement.id} title={announcement.title} />
                )))}
              </div>
            </div>
            <div className={styles.eventsContainer}>
              <Typography style={{ fontSize: '24px' }}>Upcoming Events</Typography>
              <div className={styles.list}>
                {upcomingEvents && (upcomingEvents.map((event) => (
                  <ItemCard key={event.id} title={event.title} />
                )))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}
