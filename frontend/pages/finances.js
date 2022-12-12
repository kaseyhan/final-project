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
	const homeID = '639508e44c9f274f9cec2a85'
	const userID = '639508e64c9f274f9cec2b23' 
	const api = axios.create({ baseURL: BASE_URL });

	const fetchData = async() => {
		try {

		} catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
			setIsLoading(true);
			fetchData().then(function(response) {
					setIsLoading(false);
			});
	}, []);

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
						<div className={styles.listItem}>
							<div className={[styles.listColumn, styles.user].join(" ")}>
								<p>hi</p>
							</div>
							<div className={[styles.listColumn, styles.amount].join(" ")}>
								<p>$50</p>
							</div>
						</div>
						
					</div>
					<div className={styles.owesYouTable}>

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