import Head from 'next/head';
import Layout from '../components/layout';
import Navbar from '../components/Navbar'
import axios from 'axios'
import React, {useState, useEffect} from 'react'
import Modal from "../components/modal";
import styles from '../styles/finances.module.css'

export default function Finances() {
	const BASE_URL = "http://localhost:4000/api";
	// const BASE_URL = "https://gsk-final-project-api.herokuapp.com/api";

	const [isLoading, setIsLoading] = useState(true);
	const [users, setUsers] = useState([]);
	const [youOwe, setYouOwe] = useState([]);
	const [owesYou, setOwesYou] = useState([]);
	const homeID = '639508e44c9f274f9cec2a85'
	const userID = '639508e64c9f274f9cec2b23' 
	const api = axios.create({ baseURL: BASE_URL });

	const fetchData = async() => {
		try {
			// let p = {
			// 		"params": {
			// 				"where": {
			// 					"home": homeID
			// 				}
			// 		}
			// }

			// const userGet = await api.get('users', p);
			// setUsers(userGet.data.data);
			// await users;
			let endpoint = 'homes/' + homeID;
			const homeGet = await api.get(endpoint);
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
			const userGet = await api.get('users',p);
			setUsers(userGet.data.data);

		} catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
			setIsLoading(true);
			fetchData().then(function(response) {
					setIsLoading(false);
					const isCurrUser = (element) => element._id === userID;
					let currUser = users.find(isCurrUser);
					// if (currUser) {
					// 	console.log("found");
					// } else {
					// 	console.log("DIDN'T FIND")
					// }
					let y = [];
					let o = [];
					for (let i = 0; i < currUser.debts.length; i++) {
						if (currUser.debts[i].amount > 0) y.push(currUser.debts[i]);
						else if (currUser.debts[i].amount < 0) o.push(currUser.debts[i]);
					}
					setYouOwe(y);
					setOwesYou(o);
			});
	}, []);

	function titleCase(str) {
		if (str) {
				return str.replace(
				/\w\S*/g,
				function(t) {
						return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase();
				}
				);
		} else {
				return "EMPTY"
		}
	}

	function getUserName(id) {
		const isUser = (element) => element._id === id;
		let user = users.find(isUser);
		return titleCase(user.name);
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
				<Modal>

				</Modal>
				<div className={styles.bottom}>
					<button className={styles.enterNewExpenseButton}>Enter new expense</button>
				</div>
			</div>
		</Layout>
	)
}