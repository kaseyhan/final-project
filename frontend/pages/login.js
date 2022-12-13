import styles from '../styles/Login.module.css'
import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'


export default function NameForm() {

  const BASE_URL = "https://gsk-final-project-api.herokuapp.com/api";
  const api = axios.create({ baseURL: BASE_URL });
  const [loginEmail, setEmail] = useState('');
  const [loginPassword, setPassword] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState({});
  const router = useRouter();


  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  }

  const handleClick = async (event) => {
    event.preventDefault();
    if (loginEmail.length == 0 || loginPassword.length == 0) {
      setError("Please enter an email and a password to attempt to login.");
      return;
    }

    query["email"] = loginEmail;
    query["password"] = loginPassword;
    let p = {
      "params": {
        "where": JSON.stringify(query)
      }
    }
    console.log(p);
    const user_get = await api.get("/users", p).then(function (response) {
      // console.log(response.data.data[0]._id)

      if (response.data.data.length == 1) {
        // console.log(response);
        // console.log(response.data.data[0]._id);
        window.sessionStorage.setItem("userID", response.data.data[0]._id)
        router.push('/');

      } else {
        setError("No account matches that username and password.");
      }
    }
    ).catch(error => {
      setError(error.message);
    })
  }


  const goToRegister = async (event) => {
    router.push('/register');
  }

  return (
    <div>
      <div className={styles.header}>
        <img className={styles.logobox} src="/assets/logo.png"></img>
      </div>
      <form className={styles.body}>
        <div className={styles.container} name="login-container">
          <h2 className={styles.h2}>Login Below!</h2>
          <div className={styles.child}>
            <label><b>Email: </b></label>
            <input className={styles.input} type="text" placeholder="Enter Email" name="email" value={loginEmail} onChange={handleEmailChange} required />
          </div>
          <div className={styles.child}>
            <label ><b>Password: </b></label>
            <input className={styles.input} type="password" placeholder="Enter Password" name="psw" value={loginPassword} onChange={handlePasswordChange} required />
          </div>

          <div className={styles.child}>
            <button onClick={handleClick} className={styles.button}>Login</button>
          </div>
          <div className={styles.child}>
            <button type="newuser" id="registerRoute" className={styles.button} onClick={goToRegister}>Register a New User</button>
          </div>
          {error && (
            <p>
              {error}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
