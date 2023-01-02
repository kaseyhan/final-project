import Head from 'next/head';
import Layout from '../components/layout';
import Navbar from '../components/Navbar'
import { useRouter } from 'next/router'
import axios from 'axios'
import React, {useState, useEffect} from 'react'
import Modal from "../components/modal";
import styles from '../styles/inventory.module.css'
import utils from '../components/utils'

export default function Inventory() {
	const BASE_URL = "http://localhost:4000/api";
	// const BASE_URL = "https://cs409-final-project.herokuapp.com/api";
    const router = useRouter();

	const [isLoading, setIsLoading] = useState(true);
	const [currUser, setCurrUser] = useState({});
	const [users, setUsers] = useState([]);
	const [home, setHome] = useState({});
	const [inventory, setInventory] = useState([]);
	const [newItem, setNewItem] = useState(null);
	const [show, setShow] = useState(false);

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

				const homeGet = await api.get('homes/'+homeID);
				setHome(homeGet.data.data);
				setInventory(homeGet.data.data.inventory);

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
	
			} catch (error) {
				console.error(error);
			}
		}
			setIsLoading(true);
			fetchData().then(() => {
					setIsLoading(false);	
			});
	}, []);

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
        <title>Inventory</title>
      </Head>
      <Navbar />
			<div className={styles.pageContents}>
        		<h1>Inventory</h1>
				{inventory.length > 0 ? 
					<div>
					<div className={styles.table}>
						<div className={styles.listHeader}>
							<span>
								<h3 className={styles.listColumn}>Item</h3>
								<h3 className={styles.listColumn}>Delete</h3>
							</span>
						</div>
							{inventory.map((item, index) => (
								<div className={styles.listItem}>
									<div className={[styles.listColumn, styles.item].join(" ")}>{item}</div>
									<div className={[styles.listColumn, styles.delete].join(" ")}><img src="https://iili.io/HC8ZRx1.png" width="20px" height="20px" onClick={(event)=> {
										let i = [...inventory];
										const isItemToDelete = (element) => element === item;
										let idx = i.findIndex(isItemToDelete);
										let x = i.splice(idx,1);
										let h = {
											name: home.name,
											password: home.password,
											address: home.address,
											landlordName: home.landlordName,
											leaseLink: home.leaseLink,
											announcements: home.announcements,
											inventory: i
										};
										let endpoint = 'homes/' + home._id;
										api.put(endpoint,h).then(function(response) {
											setInventory(i);
											setHome(response.data.data)
										}).catch(function(error) {
											console.log(error);
										})
									}}></img></div>
								</div>
								))}
						</div>
				</div> : <p>No items in inventory...</p>}
				<Modal title="Add item" button="Submit" onClose={() => setShow(false)} show={show}>
					<label htmlFor="amount">Name</label>
					<input type="text" className={styles.itemInput} onChange={event => {
						setNewItem(event.target.value);
					}}></input>
					<br></br>
					<br></br>
                
                <div className={styles.submitButtons}>
                    <button className={styles.modalButton} onClick={() => {
						let i = [...inventory];
						if (!i.find(element => element == newItem)) {
							i.push(newItem);
							let h = {
								name: home.name,
								password: home.password,
								address: home.address,
								landlordName: home.landlordName,
								leaseLink: home.leaseLink,
								announcements: home.announcements,
								inventory: i
							};
							let endpoint = 'homes/' + currUser.home;
							api.put(endpoint,h)
							.then(function(response) {
								setInventory(i);
								setHome(response.data.data);
								setNewItem(null);
							})
							.catch(function(error) {
								console.log(error);
							})
						}  
                    setShow(false)}}>Submit</button>
                </div>

            </Modal>
				<div className={styles.bottom}>
					<button className={styles.addItemButton} onClick={() => setShow(true)}>Add item</button>
				</div>
			</div>
		</Layout>
	)
}