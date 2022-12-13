import styles from '../styles/Login.module.css'
import axios from 'axios'
import React, { useState } from 'react'
import { useRouter } from 'next/router'

export default function registerPage() {
  const BASE_URL = "https://gsk-final-project-api.herokuapp.com/api";
  const api = axios.create({ baseURL: BASE_URL });
  const [newName, setName] = useState('');
  const [newEmail, setEmail] = useState('');
  const [newPassword, setPassword] = useState('');
  const [newHomeName, setHomeName] = useState('');
  const [newHomePassword, setHomePassword] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState({});
  const router = useRouter();
  const [homeQuery, setHomeQuery] = useState({});
  const [homeMembers, setHomeMembers] = useState([]);

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

  const handleHomeNameChange = (event) => {
    setHomeName(event.target.value);
    console.log(event.target.value);
  }

  const handleHomePasswordChange = (event) => {
    setHomePassword(event.target.value);
    console.log(event.target.value);
  }

  const handleClick = async (event) => {
    event.preventDefault();
    query["name"] = newName;
    query["email"] = newEmail;
    query["password"] = newPassword;
    if (newHomeName.length > 0 && newHomePassword.length > 0) {
      homeQuery["name"] = newHomeName;
      homeQuery["password"] = newHomePassword;
      let p = {
        "params": {
          "where": JSON.stringify(homeQuery)
        }
      }
      const home = await api.get('/homes', p).then(function(response){
        console.log(response);
        query['home'] = response.data.data[0]._id;
        homeMembers = response.data.data[0].members;
      }).catch(error => {
        console.log(error.response);
        setError(error.response);
        return;
      })
    }
    
    const res = await api.post('/users', query).then(function (response) {
      if (response.status == 200 || response.status == 201) {
        if (homeMembers.length != 0) {
          homeMembers.push(response.data.data._id);
          homeQuery["members"] = homeMembers;
        }
        window.sessionStorage.setItem("userID", response.data.data._id)
        router.push('/');
      } else {
        setError("There was an error");
      }
    }
    ).catch(error => {
      console.log(error.response.data.message);
      setError(error.response.data.message);
    }
    )
    
    const updateHome = await api.post('/homes', homeQuery
    ).catch(error => {
      console.log(error.response.data.message);
      setError(error.response.data.message);
    })
  }

  const goToLogin = (event) => {
    router.push('/login');
  }

  return (
    <div>
      <div className={styles.header}>
        <img className={styles.logobox} src="/assets/logo.png"></img>
      </div>

      <form className={styles.body}>
        <div className={styles.container} name="register-container">
          <h2>Create a New User.</h2>
          <div className={styles.child}>
            <label><b>Name: </b></label>
            <input type="text" placeholder="Enter Name" name="email" value={newName} onChange={handleNameChange} required />
          </div>
          <div className={styles.child}>
            <label><b>Email: </b></label>
            <input type="text" placeholder="Enter Email" name="email" value={newEmail} onChange={handleEmailChange} required />
          </div>
          <div className={styles.child}>
            <label ><b>Password: </b></label>
            <input type="password" placeholder="Enter Password" value={newPassword} onChange={handlePasswordChange} required />
          </div>
          <div className={styles.child}>
            <label ><b>Optional Home Name </b></label>
            <input type="home" placeholder="Enter Home Name" value={newHomeName} onChange={handleHomeNameChange} />
          </div>
          <div className={styles.child}>
            <label ><b>If you want to join a current home, enter the Password below: </b></label>
            <input type="password" placeholder="Enter Home Password" value={newHomePassword} onChange={handleHomePasswordChange} />
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