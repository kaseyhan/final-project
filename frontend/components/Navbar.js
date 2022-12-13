import { useEffect, useState } from 'react';
import NavLink from './NavLink'
import Link from 'next/link';
import Image from 'next/image';
import Avatar from '@mui/material/Avatar';
import { Menu, MenuItem, IconButton } from '@mui/material'
import { FaBars } from 'react-icons/fa';
import { RxCross1 } from 'react-icons/rx'
import axios from 'axios';

import styles from '../styles/Navbar.module.css'
// icons by IconScout/unicon

const BASE_URL = 'https://gsk-final-project-api.herokuapp.com/api/';
const API = axios.create({ baseURL: BASE_URL });

// cite: https://mui.com/material-ui/react-avatar/
function stringAvatar(name, color) {
	return {
		sx: {
			bgcolor: color,
			width: 48,
			height: 48
		},
		children: name ? `${name.split(' ')[0][0].toUpperCase()}${name.split(' ')[1][0].toUpperCase()}` : null,
	};
}


export default function Navbar() {
	const userID = "63952f07f77a950017fe9466";

	const [anchorEl, setAnchorEl] = useState(null);
	const [user, setUser] = useState(null)
	const open = Boolean(anchorEl);
	const handleOpenMenu = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleCloseMenu = () => {
		setAnchorEl(null);
	};

	const fetchData = async () => {
		const res = await API.get(`users/${userID}`);
		setUser(res.data.data);
	}

	useEffect(() => {
		fetchData();
	}, []);

	return (
		<>
			<div className={styles.navbar}>
				<div className={styles.logoBox}>
					<Link href="/">
						<Image src="/assets/logo.png" alt="ourhouse_logo" width='200' height='60' />
					</Link>
				</div>
				<div className={styles.links}>
					<NavLink name="My Home" href="/" icon='/assets/house-user.svg' />
					<NavLink name="To-Do" href="/to-do" icon='/assets/list-ul.svg' />
					<NavLink name="Calendar" href="/calendar" icon='/assets/schedule.svg' />
					{/* <NavLink name="Chat" href="/chat" icon='/assets/comments-alt.svg' /> */}
					<NavLink name="Finances" href="/finances" icon='/assets/dollar-alt.svg' />
					{/* <NavLink name="Analytics" href="/analytics" icon='/assets/chart-line.svg' /> */}
				</div>

				<div className={styles.userBox}>
					{/* handle login authentication here -> if no user logged in show log in button instead */}
					<div className={styles.bars}>
						<IconButton
							aria-label="more"
							id="long-button"
							aria-controls={open ? 'long-menu' : undefined}
							aria-expanded={open ? 'true' : undefined}
							aria-haspopup="true"
							onClick={handleOpenMenu}
						>
							<FaBars />
						</IconButton>
					</div>

					<Menu
						id="long-menu"
						MenuListProps={{
							'aria-labelledby': 'long-button',
						}}
						anchorEl={anchorEl}
						open={open}
						onClose={handleCloseMenu}
					>
						<IconButton onClick={handleCloseMenu}><RxCross1 /></IconButton>
						<MenuItem onClick={handleCloseMenu}><Link href="/">My Home</Link></MenuItem>
						<MenuItem onClick={handleCloseMenu}><Link href="/to-do">To-Do</Link></MenuItem>
						<MenuItem onClick={handleCloseMenu}><Link href="/calendar">Calendar</Link></MenuItem>
						{/* <MenuItem onClick={handleCloseMenu}><Link href="/chat">Chat</Link></MenuItem> */}
						<MenuItem onClick={handleCloseMenu}><Link href="/finances">Finances</Link></MenuItem>
						{/* <MenuItem onClick={handleCloseMenu}><Link href="/analytics">Analytics</Link></MenuItem> */}
					</Menu>

					<Link href="/login">
						<Avatar {...stringAvatar(user ? user.name : null, user ? user.color : 'gray')} />
					</Link>
				</div>
			</div>
		</>
	)
}