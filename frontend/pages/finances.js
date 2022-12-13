import Head from 'next/head';
import Layout from '../components/layout';
import Navbar from '../components/Navbar'
import axios from 'axios'
import React, {useState, useEffect} from 'react'
import Modal from "../components/modal";
import styles from '../styles/finances.module.css'

export default function Finances() {
	// const BASE_URL = "http://localhost:4000/api";
	const BASE_URL = "https://gsk-final-project-api.herokuapp.com/api";

	const [isLoading, setIsLoading] = useState(true);
	const [currUser, setCurrUser] = useState({});
	const [users, setUsers] = useState([]);
	const [otherUsers, setOtherUsers] = useState([]);
	const [youOwe, setYouOwe] = useState([]);
	const [owesYou, setOwesYou] = useState([]);
	const [amount, setAmount] = useState(0);
	const [activeAssigneeButton, setActiveAssigneeButton] = useState([]);
	const [show, setShow] = useState(false);

	// const homeID = '639508e44c9f274f9cec2a85'
	const currUserID = '639508e64c9f274f9cec2b23' 
	const api = axios.create({ baseURL: BASE_URL });
	// let currUserID = sessionStorage.getItem("user");		UNCOMMENT

	useEffect(() => {
		const fetchData = async() => {
			try {
                const currUserGet = await api.get('users/'+currUserID);
                setCurrUser(currUserGet.data.data);
				let homeID = currUserGet.data.data.home;

				const homeGet = await api.get('homes/'+homeID);
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

				let others = [];
				for (let i = 0; i < usersGet.data.data.length; i++) {
					if (usersGet.data.data[i]._id !== currUserGet.data.data._id) others.push(usersGet.data.data[i]);
				}
				setOtherUsers(others);
				
				setOwes(currUserGet.data.data);	
	
			} catch (error) {
				console.error(error);
			}
		}
			setIsLoading(true);
			fetchData().then(() => {
					setIsLoading(false);	
			});
	}, []);

	function setOwes(user) {
		let y = [];
		let o = [];
		for (let i = 0; i < user.debts.length; i++) {
			if (user.debts[i].amount > 0) y.push(user.debts[i]);
			else if (user.debts[i].amount < 0) o.push(user.debts[i]);
		}
		setYouOwe(y);
		setOwesYou(o);
	}

	function titleCase(str) {
		if (str) {
				return str.replace(
				/\w\S*/g,
				function(t) {
						return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase();
				}
				);
		} else {
				return ""
		}
	}

	function getUserName(id) {
		return titleCase(getUser(id).name);
	}
	function getUser(id) {
		const isUser = (element) => element._id == id;
		let user = users.find(isUser);
		return user;
	}
	function findDebtIdx(debts,id) {
		const isDebt = (element) => element.user == id;
		return debts.findIndex(isDebt);
	}

	if (isLoading) {
		return <div className={styles.pageContents}>Loading...</div>;
	} else return(
		<Layout>
			<Head>
        <title>Finances</title>
      </Head>
      <Navbar />
			<div className={styles.pageContents}>
        		<h1>Finances</h1>
				<div className={styles.tables}>
					<div className={styles.youOweTable}>
						<div className={styles.listHeader}>
							<span>
								<h3 className={styles.listColumn}>You owe</h3>
								<h3 className={styles.listColumn}>Amount</h3>
							</span>
						</div>
							{youOwe.map((debt, index) => (
								<div className={styles.listItem}>
									<div className={[styles.listColumn, styles.user].join(" ")}>{getUserName(debt.user)}</div>
									<div className={[styles.listColumn, styles.amount].join(" ")}>{debt.amount}</div>
								</div>
								))}
					</div>
					<div className={styles.owesYouTable}>
					<div className={styles.listHeader}>
							<span>
								<h3 className={styles.listColumn}>Owes you</h3>
								<h3 className={styles.listColumn}>Amount</h3>
							</span>
						</div>
						{owesYou.map((debt, index) => (
								<div className={styles.listItem}>
									<div className={[styles.listColumn, styles.user].join(" ")}>{getUserName(debt.user)}</div>
									<div className={[styles.listColumn, styles.amount].join(" ")}>{-debt.amount}</div>
								</div>
								))}
					</div>
				</div>
				<Modal title="Enter new expense" button="Submit" onClose={() => setShow(false)} show={show}>
					<label htmlFor="amount">Amount</label>
					<input type="number" className={styles.amountInput} onChange={event => {
						setAmount(event.target.value);
					}}></input>
					<br></br>
					<br></br>

					<label htmlFor="assignees">Charge</label>
                <div id="assignees">
                    {otherUsers.map((user, index) => (
                        <button className={activeAssigneeButton.includes(user._id) ? `${styles.assigneeButton} ${styles.active}` : 
                        styles.assigneeButton} id={user._id} key={index} onClick={(event) => {
                            if (activeAssigneeButton.includes("everyone")) {
                                setActiveAssigneeButton([user._id]);
                            } else if (activeAssigneeButton.includes(user._id)) {
                                let a = [...activeAssigneeButton];
                                const isAssigneeToDelete = (element) => element === user._id;
                                let idx = a.findIndex(isAssigneeToDelete);
                                let x = a.splice(idx,1);
                                setActiveAssigneeButton(a);
                            } else {
                                let a = [...activeAssigneeButton];
                                a.push(user._id);
                                setActiveAssigneeButton(a);
                            }
                        }}>{getUserName(user._id)}</button>
                    ))}
                    <button className={activeAssigneeButton[0]==="everyone" ? `${styles.assigneeButton} ${styles.active}` : 
                            styles.assigneeButton} id="everyone" onClick={(event) => {
                        if (activeAssigneeButton.length === 1 && activeAssigneeButton[0] === "everyone") setActiveAssigneeButton([]);
                        else setActiveAssigneeButton(["everyone"]);
                    }}>Everyone</button>
                </div>
                <br></br>

                <div className={styles.submitButtons}>
                    <button className={styles.modalButton} onClick={() => {
						let u = {...currUser};
						let ids = [];
						if (activeAssigneeButton.length === 1 && activeAssigneeButton[0] === "everyone") {
							for (let i = 0; i < otherUsers.length; i++) {
								ids.push(otherUsers[i]._id);
							}
						} else {
							ids = [...activeAssigneeButton];
						}

						for (let i = 0; i < ids.length; i++) {
							let idx = findDebtIdx(u.debts,ids[i]);
							if (idx !== -1) u.debts[idx].amount += -amount;
							else u.debts.push({user: ids[i], amount: -amount});
						}
						console.log(u);

						let endpoint = 'users/' + u._id;
						api.put(endpoint,u)
						.then(function(response) {
							setCurrUser(u);
							setOwes(u);
						})
						.catch(function(error) {
							console.log(error);
						})
					

						setAmount(0);
						setActiveAssigneeButton([]);      
                    setShow(false)}}>Submit</button>
                </div>

            </Modal>
				<div className={styles.bottom}>
					<button className={styles.enterNewExpenseButton} onClick={() => setShow(true)}>Enter new expense</button>
				</div>
			</div>
		</Layout>
	)
}