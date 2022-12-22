import Head from 'next/head';
import Layout from '../components/layout';
import Navbar from '../components/Navbar'
import { useRouter } from 'next/router'
import axios from 'axios'
import React, {useState, useEffect} from 'react'
import Modal from "../components/modal";
import styles from '../styles/analytics.module.css'
import utils from '../components/utils'
import { Bar, Pie } from "react-chartjs-2";
import Chart from 'chart.js/auto';

export default function Analytics() {
	// const BASE_URL = "http://localhost:4000/api";
	const BASE_URL = "https://cs409-final-project.herokuapp.com/api";
    const router = useRouter();

	const [isLoading, setIsLoading] = useState(true);
	const [currUser, setCurrUser] = useState({});
	const [users, setUsers] = useState([]);
	const [otherUsers, setOtherUsers] = useState([]);
	const [metric, setMetric] = useState("completedTasks");
	const [chartType, setChartType] = useState("bar");
	const [data, setData] = useState({});
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
				

				// let others = [];
				// for (let i = 0; i < usersGet.data.data.length; i++) {
				// 	if (usersGet.data.data[i]._id !== currUserGet.data.data._id) others.push(usersGet.data.data[i]);
				// }
				// setOtherUsers(others);
				await getData(metric, usersGet.data.data);
	
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

	async function getData(metric,users) {
		let d = [];
		for (let i = 0; i < users.length; i++) {
			if (metric == "completedTasks") {
				let q = {"assignee": users[i]._id, completed: true};
				let p = {"params": {"where": JSON.stringify(q), "count":"true"}}
				const t = await api.get('tasks',p)
				d.push(t.data.data.count);
			} else if (metric == "uncompletedTasks") {
				let q = {"assignee": users[i]._id, completed: false};
				let p = {"params": {"where": JSON.stringify(q), "count":"true"}}
				const t = await api.get('tasks',p)
				d.push(t.data.data.count);
			} else if (metric == "allTasks") {
				let q = {"assignee": users[i]._id};
				let p = {"params": {"where": JSON.stringify(q), "count":"true"}}
				const t = await api.get('tasks',p)
				d.push(t.data.data.count);
			} else if (metric == "eventsHosted") {
				let q = {"host": users[i]._id};
				let p = {"params": {"where": JSON.stringify(q), "count":"true"}}
				const e = await api.get('events',p)
				d.push(e.data.data.count);
			}
		}

		let l;
		if (metric == "completedTasks") l = "# completed tasks";
		else if (metric == "uncompletedTasks") l = "# uncompleted tasks";
		else if (metric == "allTasks") l = "# tasks";
		else if (metric == "eventsHosted") l = "# events hosted";
		else l = "# completed tasks" // ???

		const dataWrapper = {
			labels: users.map((user) => user.name),
			datasets: [{
				label: l,
				data: d,
				backgroundColor: users.map((user) => user.color),
				// borderColor: ["aqua", "green", "red", "yellow"],
				// borderWidth: 0.5,
			},],
		}
		setData(dataWrapper);
	}

	if (isLoading) {
		return <div className={styles.pageContents}>Loading...</div>;
	} else return(
		<Layout>
			<Head>
        <title>Analytics</title>
      </Head>
      <Navbar />
			<div className={styles.pageContents}>
        		<h1>Analytics</h1>
				<div className={styles.dropdowns}>
					<div className={styles.metricDropDiv}>
						<label htmlFor="metricDropdown">Metric: </label>
						<select id="metricDropdown" defaultValue="completedTasks" onChange={event => {
							setMetric(event.target.value);
							// getData(event.target.value,users);
						}}>
							<option value="completedTasks">Completed tasks</option>
							<option value="uncompletedTasks">Uncompleted tasks</option>
							<option value="allTasks">All tasks</option>
							<option value="eventsHosted">Events hosted</option>
						</select>
					</div>
					<div className={styles.chartDropDiv}>
						<label htmlFor="chartDropdown">Chart type: </label>
						<select id="chartDropdown" defaultValue="bar" onChange={event => {
							setChartType(event.target.value);
						}}>
							<option value="bar">Bar</option>
							<option value="pie">Pie</option>
						</select>
					</div>
				</div>
				<div className={styles.chart}>
					{chartType === "bar" ?
						<Bar id="chart" data={data} className={styles.barChart} />
						: <Pie id="chart" data={data} height={400} options={{responsive:false}} className={styles.pieChart} />
					}
				</div>
			</div>
		</Layout>
	)
} 