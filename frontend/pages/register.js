import styles from '../styles/Register.module.css'
import axios from 'axios'
import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { useRouter } from 'next/router'

export default function Register() {
  // const BASE_URL = "http://localhost:4000/api";
  const BASE_URL = "https://cs409-final-project.herokuapp.com/api";
  const api = axios.create({ baseURL: BASE_URL });
  const [newName, setName] = useState('');
  const [newEmail, setEmail] = useState('');
  const [newPassword, setPassword] = useState('');
  const [newHomePassword, setHomePassword] = useState('');
  const [newHomeName, setHomeName] = useState('');
  const [newColor, setNewColor] = useState('');
  const [error, setError] = useState('');
  // const [query, setQuery] = useState({});
  const router = useRouter();

  const handleNameChange = (event) => {
    setName(event.target.value);
  }

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  }

  const handleHomeNameChange = (event) => {
    setHomeName(event.target.value);
  }

  const handleHomePasswordChange = (event) => {
    setHomePassword(event.target.value);
  }

  const handleColorChange = (event) => {
    setNewColor(event.target.value);
  }

  const handleClick = async (event) => {
    setError('');
    event.preventDefault();
    let new_user = {
      name: newName,
      email: newEmail,
      password: newPassword
    }
    if (newColor) new_user["color"] = newColor;

    if (newHomePassword.length > 0) {
      let q = {"name": newHomeName};
      let p = {"params": {"where": JSON.stringify(q)}}
      const homeGet = await api.get('homes',p).then(function (response) {
        let homes = response.data.data
        if (homes.length === 0) {
          setError("A Home with the provided name does not exist.")
          return;
        }

        for (let i = 0; i < homes.length; i++) {
          if (homes[i].password === newHomePassword) new_user["home"] = homes[i]._id;
        }

        if (!new_user.hasOwnProperty("home")) setError("Home password was incorrect.")

      }).catch(function (error) {
        console.log(error);
      })
    }
    const res = await api.post('/users', new_user).then(function (response) {
      if (response.status == 200 || response.status == 201) {
        window.sessionStorage.setItem("userID", response.data.data._id)
        router.push('/');
      } else {
        setError("Error creating user");
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
      <form className={styles.body}>
        <div className={styles.container} name="register-container">
          <h2>Create a New User</h2>
          <div className={styles.child}>
            <label>Name: </label>
            <input type="text" placeholder="Enter name" name="email" value={newName} onChange={handleNameChange} required />
          </div>
          <div className={styles.child}>
            <label>Email: </label>
            <input type="text" placeholder="Enter email" name="email" value={newEmail} onChange={handleEmailChange} required />
          </div>
          <div className={styles.child}>
            <label>Password: </label>
            <input type="password" placeholder="Enter password" value={newPassword} onChange={handlePasswordChange} required />
          </div>
          <div className={styles.child}>
            <label>Color (optional): </label>
            <input type="color" onChange={handleColorChange}/>
          </div>
          <div className={styles.child}>
            <label>Home name (optional): </label>
            <input type="text" placeholder="Enter Home name" value={newHomeName} onChange={handleHomeNameChange} />
          </div>
          <div className={styles.child}>
            <label>Home password (optional): </label>
            <input type="password" placeholder="Enter Home password" value={newHomePassword} onChange={handleHomePasswordChange} />
          </div>
          <div className={styles.child}>
            <button onClick={handleClick} className={styles.createAccountButton}>Create Account</button>
          </div>
          <div className={styles.child}>
            <button className={styles.loginButton} onClick={goToLogin}>Go back to login page</button>
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