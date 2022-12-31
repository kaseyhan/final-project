import Head from 'next/head';
import Layout from '../components/layout';
import Navbar from '../components/Navbar'
import { useRouter } from 'next/router'
import axios from 'axios'
import React, {useState, useEffect} from 'react'
import Modal from "../components/modal";
import styles from '../styles/my-home.module.css'
import utils from '../components/utils'

export default function MyHome() {
	// const BASE_URL = "http://localhost:4000/api";
	const BASE_URL = "https://cs409-final-project.herokuapp.com/api";
    const router = useRouter();

	const [isLoading, setIsLoading] = useState(true);
	const [currUser, setCurrUser] = useState({});
    const [home, setHome] = useState({});
    const [editHome, setEditHome] = useState({});
    const [newHome, setNewHome] = useState({});
	const [users, setUsers] = useState([]);
    const [homeToJoin, setHomeToJoin] = useState({});
    const [reload, setReload] = useState(false);
	
	const [show, setShow] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [error, setError] = useState("");

	let currUserID = null;
	const api = axios.create({ baseURL: BASE_URL });

	useEffect(() => {
		const fetchData = async() => {
			try {
				if (typeof window !== 'undefined') currUserID = window.sessionStorage.getItem("userID");
                if (currUserID === "undefined" || currUserID == null) router.push('/login');    

                const currUserGet = await api.get('users/'+currUserID);
                setCurrUser(currUserGet.data.data);
				let homeID = currUserGet.data.data.home;
                if (homeID !== "none") {
                    const homeGet = await api.get('homes/'+homeID);
                    setHome(homeGet.data.data);
                    setEditHome(homeGet.data.data);
                    const members = homeGet.data.data.members;
                    let query = {
                        "_id": {
                            "$in": members
                        }
                    }
                    let p = {
                        "params": {
                            "where": JSON.stringify(query)
                        }
                    }
                    const usersGet = await api.get('users',p);
                    setUsers(usersGet.data.data);
                }
	
			} catch (error) {
				console.error(error);
			}
		}
			setIsLoading(true);
			fetchData().then(() => {
					setIsLoading(false);	
			});
            console.log(reload);
	}, [reload]);

	function getUserName(id) {
		return utils.toTitleCase(getUser(id).name);
	}
	function getUser(id) {
		const isUser = (element) => element._id == id;
		let user = users.find(isUser);
		return user;
	}

	if (isLoading) {
		return <div className={styles.pageContents}>Loading...</div>;
	} else return(
		<Layout>
			<Head>
        <title>My Home</title>
      </Head>
      <Navbar />
		<div className={styles.pageContents}>
        	<h1>My Home</h1>
            {currUser.home !== "none" ? (
            <div>
                <div className={styles.homeInfoContainer}>
                    <div className={styles.info}>
                        <p>Name: {home.name}</p>
                    </div>
                    <div className={styles.info}>
                        <p>Password: {home.password}</p>
                    </div>
                    <div className={styles.info}>
                        <p>Members:</p>
                        {users.map((user, index) => (
                            <span>{utils.toTitleCase(user.name)}{index < users.length-1 ? "," : ""} </span>
                        ))}
                    </div>
                    <div className={styles.info}>
                        <p>Address: {home.address ? home.address : "None"}</p>
                    </div>
                    <div className={styles.info}>
                        <p>Landlord: {home.landlordName ? home.landlordName : "None"}</p>
                    </div>
                    <div className={styles.info}>
                        <p>Landlord phone number: {home.landlordPhoneNumber ? home.landlordPhoneNumber : "None"}</p>
                    </div>
                    <div className={styles.info}>
                        <p>Lease link:</p>
                        {home.leaseLink ?
                            <a href={home.leaseLink}>{home.leaseLink}</a>
                            : <p>None</p>}
                        {/* <p>Lease link: {home.leaseLink ? home.leaseLink : "None"}</p> */}
                    </div>
                </div>
                <Modal title="Edit Home details" button="Save Changes" onClose={() => setShow(false)} show={show}>
                    <div className={styles.modalContents}>
                        <div className={styles.infoModal}>
                            <label htmlFor="nameInput">Name:</label>
                            <input type="text" id="nameInput" defaultValue={home.name} onChange={(event) => {
                                let h = {...editHome};
                                h["name"] = event.target.value;
                                setEditHome(h);
                            }}/>
                        </div>
                        <div className={styles.infoModal}>
                            <label htmlFor="passwordInput">Password:</label>
                            <input type="password" id="passwordInput" defaultValue={home.password} onChange={(event) => {
                                let h = {...editHome};
                                h["password"] = event.target.value;
                                setEditHome(h);
                            }}/>
                        </div>
                        {/* <div className={styles.info}>
                            <p>Members:</p>
                            {users.map((user, index) => (
                                <span>{utils.toTitleCase(user.name)}{index < users.length-1 ? "," : ""} </span>
                            ))}
                        </div> */}
                        <div className={styles.infoModal}>
                            <label htmlFor="addressInput">Address:</label>
                            <input type="text" id="addressInput" defaultValue={home.address} onChange={(event) => {
                                let h = {...editHome};
                                h["address"] = event.target.value;
                                setEditHome(h);
                            }}/>
                        </div>
                        <div className={styles.infoModal}>
                            <label htmlFor="landlordInput">Landlord name:</label>
                            <input type="text" id="landlordInput" defaultValue={home.landlordName} onChange={(event) => {
                                let h = {...editHome};
                                h["landlordName"] = event.target.value;
                                setEditHome(h);
                            }}/>
                        </div>
                        <div className={styles.infoModal}>
                            <label htmlFor="landlordPhoneInput">Landlord phone number:</label>
                            <input type="text" id="landlordPhoneInput" defaultValue={home.landlordPhoneNumber} onChange={(event) => {
                                let h = {...editHome};
                                h["landlordPhoneNumber"] = event.target.value;
                                setEditHome(h);
                            }}/>
                        </div>
                        <div className={styles.infoModal}>
                            <label htmlFor="leaseLinkInput">Lease link:</label>
                            <input type="text" id="leaseLinkInput" defaultValue={home.leaseLink} onChange={(event) => {
                                let h = {...editHome};
                                h["leaseLink"] = event.target.value;
                                setEditHome(h);
                            }}/>
                        </div>
                    </div>
                    <div className={styles.submitButtons}>
                        <button className={styles.modalButton} onClick={() => {
                            let h = {
                                name: editHome.name,
                                password: editHome.password,
                                address: editHome.address,
                                landlordName: editHome.landlordName,
                                landlordPhoneNumber: editHome.landlordPhoneNumber,
                                leaseLink: editHome.leaseLink
                            };

                            // if (editHome.name) h["name"] = editHome.name;
                            // if (editHome.password) h["password"] = editHome.password;
                            // if (editHome.address) h["address"] = editHome.address;
                            // if (editHome.landlordName) h["landlordName"] = editHome.landlordName;
                            // if (editHome.landlordPhoneNumber) h["landlordPhoneNumber"] = editHome.landlordPhoneNumber;
                            // if (editHome.leaseLink) h["leaseLink"] = editHome.leaseLink;
                            console.log(h)
                            api.put('homes/' + home._id, h)
                            .then(function(response) {
                                setHome(h);
                                let u = {...currUser};
                                u.home = "none";
                                setCurrUser(u);
                                setReload(!reload);
                                setEditHome({});    
                                setShow(false)
                            })
                            .catch(function(response) {
                                console.log(response);
                            })
                        }}>Save changes</button>
                    </div>
                </Modal>
                <Modal title="Warning" button="Leave" onClose={() => setShowWarning(false)} show={showWarning}>
                    <p>Are you sure you want to leave this Home?</p>
                    <div className={styles.submitButtons}>
                        <button className={styles.leaveButton} onClick={() => {
                            let h = {name: home.name, password: home.password, members: home.members};
                            const isMemberToDelete = (element) => element === currUser._id;
                            let idx = h.members.findIndex(isMemberToDelete);
                            let x = h.members.splice(idx,1);

                            api.put('homes/' + home._id, h)
                            .then(function(response) {
                                setHome({});
                                setReload(!reload);
                            })
                            .catch(function(response) {
                                console.log(response);
                            })
                        setShowWarning(false)}}>Leave Home</button>
                    </div>
                </Modal>
                <div className={styles.bottom}>
                    <button className={styles.editButton} onClick={(event)=> {setShow(true)}}>Edit Home</button>
                    <button className={styles.leaveButton} onClick={(event)=> {setShowWarning(true)}}>Leave Home</button>
                </div>
            </div>)
            : (<div className={styles.noHomeContainer}>
                    <p>You are currently not in a Home.</p>
                    <Modal title="Create Home" button="Create Home" onClose={() => {setShowCreate(false); setError("")}} show={showCreate}>
                        <div className={styles.modalContents}>
                            <div className={styles.info}>
                                <label htmlFor="nameInput">Name:</label>
                                <input type="text" id="nameInput" onChange={(event) => {
                                    let h = {...newHome};
                                    h["name"] = event.target.value;
                                    setNewHome(h);
                                }} required />
                            </div>
                            <div className={styles.info}>
                                <label htmlFor="passwordInput">Password:</label>
                                <input type="password" id="passwordInput" onChange={(event) => {
                                    let h = {...newHome};
                                    h["password"] = event.target.value;
                                    setNewHome(h);
                                }} required />
                            </div>
                            <div className={styles.info}>
                                <label htmlFor="addressInput">Address:</label>
                                <input type="text" id="addressInput" onChange={(event) => {
                                    let h = {...newHome};
                                    h["address"] = event.target.value;
                                    setNewHome(h);
                                }}/>
                            </div>
                            <div className={styles.info}>
                                <label htmlFor="landlordInput">Landlord name:</label>
                                <input type="text" id="landlordInput" onChange={(event) => {
                                    let h = {...newHome};
                                    h["landlordName"] = event.target.value;
                                    setNewHome(h);
                                }}/>
                            </div>
                            <div className={styles.info}>
                                <label htmlFor="landlordPhoneInput">Landlord phone number:</label>
                                <input type="text" id="landlordPhoneInput" onChange={(event) => {
                                    let h = {...newHome};
                                    h["landlordPhoneNumber"] = event.target.value;
                                    setNewHome(h);
                                }}/>
                            </div>
                            <div className={styles.info}>
                                <label htmlFor="leaseLinkInput">Lease link:</label>
                                <input type="text" id="leaseLinkInput" onChange={(event) => {
                                    let h = {...newHome};
                                    h["leaseLink"] = event.target.value;
                                    setNewHome(h);
                                }}/>
                            </div>
                        </div>
                        <div className={styles.submitButtons}>
                            <button className={styles.modalButton} onClick={() => {
                                // let h = {
                                //     name: newHome.name,
                                //     password: newHome.password
                                // };

                                // if (newHome.name) h["name"] = newHome.name;
                                // if (newHome.password) h["password"] = newHome.password;
                                // if (newHome.address) h["address"] = newHome.address;
                                // if (newHome.landlordName) h["landlordName"] = newHome.landlordName;
                                // if (newHome.landlordPhoneNumber) h["landlordPhoneNumber"] = newHome.landlordPhoneNumber;
                                // if (newHome.leaseLink) h["leaseLink"] = newHome.leaseLink;
                                if (!newHome.hasOwnProperty("name") || newHome.name === "" || !newHome.hasOwnProperty("password") || newHome.password === "") {
                                    setError("Home name and password are required.")
                                    console.log(newHome);
                                    return;
                                }

                                api.post('homes/', newHome)
                                .then(function(response) {
                                    setHome(newHome);
                                    let u = {name: currUser.name, password: currUser.password, email: currUser.email};
                                    u.home = response.data.data._id;
                                    api.put('users/' + currUser._id, u)
                                    .then(function(res) {
                                        setCurrUser(u);
                                        setReload(!reload);
                                        setNewHome({});    
                                        setShowCreate(false)
                                    })
                                    .catch(function(err) {
                                        console.log(err);
                                    })
                                })
                                .catch(function(response) {
                                    console.log(response);
                                })
                            }}>Create Home</button>
                        </div>
                        <p>{error}</p>
                    </Modal>
                    <Modal title="Join Home" button="Join Home" onClose={() => {setShowJoin(false); setError(""); setHomeToJoin({});}} show={showJoin}>
                        <div className={styles.inputs}>
                            <label htmlFor="nameInputJoin">Home name:</label>
                            <input type="text" id="nameInputJoin"  onChange={(event) => {
                                let h = {...homeToJoin};
                                h["name"] = event.target.value;
                                setHomeToJoin(h);
                            }} required />
                            <br></br>

                            <label htmlFor="passwordInputJoin">Home password:</label>
                            <input type="password" id="passwordInputJoin"  onChange={(event) => {
                                let h = {...homeToJoin};
                                h["password"] = event.target.value;
                                setHomeToJoin(h);
                            }} required />
                        </div>
                        <div className={styles.submitButtons}>
                            <button className={styles.modalButton} onClick={() => {

                                if (!homeToJoin.hasOwnProperty("name") || !homeToJoin.hasOwnProperty("password") || 
                                    homeToJoin.name.length === 0 || homeToJoin.password.length === 0) {
                                    setError("Please enter the Home name and password.")
                                    return;
                                }

                                let query = {"name": homeToJoin.name, "password": homeToJoin.password};

                                let p = {
                                    "params": {
                                        "where": JSON.stringify(query)
                                    }
                                }

                                let close = api.get('homes',p)
                                .then(function(response) {
                                    if (response.data.data.length > 0) {
                                        let h = response.data.data[0];
                                        let u = {name: currUser.name, email: currUser.email, password: currUser.password};
                                        u["home"] = h._id;
                                        api.put('users/' + currUser._id, u)
                                        .then(function(res) {
                                            setCurrUser(u);
                                            setHomeToJoin({});
                                            setError("");
                                            setHome(h);
                                            setReload(!reload);
                                            return true;
                                        })
                                        .catch(function(error) {
                                            console.log("USER ERROR");
                                            console.log(error);
                                            return false;
                                        });
                                    } else {
                                        setError("A Home with the provided name and password was not found.")
                                        return false;
                                    }
                                })
                                .catch(function(error) {
                                    console.log("HOME ERROR");
                                    console.log(error)
                                    return false;
                                });

                                close.then(function(r) {
                                    if (r) {
                                        setShowJoin(false);
                                        setError("");
                                        setHomeToJoin({});
                                    }
                                })
                                // if (close) {
                                //     setShowJoin(false);
                                //     setError("");
                                //     setHomeToJoin({});
                                // }
                            }}>Join Home</button>
                        </div>
                        <p>{error}</p>
                    </Modal>
                    <div className={styles.buttons}>
                        <button className={styles.createHomeButton} onClick={(event) => {setShowCreate(true)}}>Create Home</button>
                        <button className={styles.joinHomeButton} onClick={(event) => {setShowJoin(true)}}>Join Home</button>
                    </div>
                </div>
            )}
		</div>
	</Layout>
	)
}