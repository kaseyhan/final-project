import styles from '../styles/Login.module.css'
import axios from 'axios'
import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { useRouter } from 'next/router'

export default function Register() {
  const BASE_URL = "https://cs409-final-project.herokuapp.com/api";
  const api = axios.create({ baseURL: BASE_URL });
  const [newName, setName] = useState('');
  const [newEmail, setEmail] = useState('');
  const [newPassword, setPassword] = useState('');
  const [newHome, setHome] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState({});
  const router = useRouter();

  const handleNameChange = (event) => {
    setName(event.target.value);
    console.log(event.target.value);
  }

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    console.log(event.target.value);
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    console.log(event.target.value);
  }

  const handleHomeChange = (event) => {
    setHome(event.target.value);
    console.log(event.target.value);
  }

  const handleClick = async (event) => {
    event.preventDefault();
    query["name"] = newName;
    query["email"] = newEmail;
    query["password"] = newPassword;
    if (newHome.length > 0) {
      query["home"] = newHome;
    }
    const res = await api.post('/users', query).then(function (response) {
      // console.log(response);
      // console.log(response.data.data._id);
      if (response.status == 200 || response.status == 201) {
        window.sessionStorage.setItem("userID", response.data.data._id)
        router.push('/');
      } else {
        setError("There was an error");
      }
    }
    ).catch(error => {
      console.log(error);
      // setError(error.response.data.message);
    }
    )
  }

  const goToLogin = (event) => {
    router.push('/login');
  }

  return (
    <div>
      <Navbar />

      <form className={styles.body}>
        <div className={styles.container} name="register-container">
          <h2>Create a New User</h2>
          <div className={styles.child}>
            <label style={{paddingRight: '10px'}}><b>Name: </b></label>
            <input type="text" placeholder="Enter Name" name="email" value={newName} onChange={handleNameChange} required />
          </div>
          <div className={styles.child}>
            <label style={{paddingRight: '10px'}}><b>Email: </b></label>
            <input type="text" placeholder="Enter Email" name="email" value={newEmail} onChange={handleEmailChange} required />
          </div>
          <div className={styles.child}>
            <label style={{paddingRight: '10px'}}><b>Password: </b></label>
            <input type="password" placeholder="Enter Password" value={newPassword} onChange={handlePasswordChange} required />
          </div>
          <div className={styles.child}>
            <label style={{paddingRight: '10px'}}><b>Home password (optional): </b></label>
            <input type="home" placeholder="Enter HomeID" value={newHome} onChange={handleHomeChange} />
          </div>
          <div className={styles.child}>
            <button type="newuser" onClick={handleClick} className={styles.button}>Create Account</button>
          </div>
          <div className={styles.child}>
            <button className={styles.button} onClick={goToLogin}>Go Back to Login Page</button>
          </div>
          {error && (
            <p>
              {error}
            </p>
          )}
        </div>
      </form>
    </div>
  )
}