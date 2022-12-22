import { useEffect, useState } from 'react';
import NavLink from './NavLink'
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Avatar from '@mui/material/Avatar';
import { Menu, MenuItem, IconButton } from '@mui/material'
import { FaBars } from 'react-icons/fa';
import { RxCross1 } from 'react-icons/rx'
import axios from 'axios';
import utils from './utils'

import styles from '../styles/Navbar.module.css'
// icons by IconScout/unicon

const BASE_URL = 'https://cs409-final-project.herokuapp.com/api/';
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
		// children: name ? utils.toTitleCase(name) : null
	};
}


export default function Navbar() {
	let currUserID = null;
	const router = useRouter();

	const [anchorEl, setAnchorEl] = useState(null);
	const [user, setUser] = useState(null)
	const open = Boolean(anchorEl);
	const [isLoading, setIsLoading] = useState(true);
	
	const handleOpenMenu = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleCloseMenu = () => {
		setAnchorEl(null);
	};

	useEffect(() => {
		const fetchData = async () => {
			if (typeof window !== 'undefined') currUserID = window.sessionStorage.getItem("userID");
			if (currUserID === "undefined" || currUserID == null) console.log("EMPTY")   
			
			try {
				const res = await API.get(`users/${currUserID}`);
				setUser(res.data.data);
			} catch (error) {
				console.log(error)
			}
		}

		setIsLoading(true);
			fetchData().then(() => {
					setIsLoading(false);	
			});
	}, []);

	if (isLoading) {
		return <div className={styles.pageContents}>Loading...</div>;
	} else {
		return (
			<>
				<div className={styles.navbar}>
					<div className={styles.logoBox}>
						<Link href="/">
							<Image src="/assets/logo.png" alt="homesweethome_logo" height='100' width='100' />
						</Link>
					</div>
					{user.home !== "none" ? 
					<div className={styles.links}>
						<NavLink name="My Home" href="/my-home" icon='/assets/house-user.svg' />
						<NavLink name="To-Do" href="/to-do" icon='/assets/list-ul.svg' />
						<NavLink name="Calendar" href="/calendar" icon='/assets/schedule.svg' />
						{/* <NavLink name="Chat" href="/chat" icon='/assets/comments-alt.svg' /> */}
						<NavLink name="Finances" href="/finances" icon='/assets/dollar-alt.svg' />
						<NavLink name="Analytics" href="/analytics" icon='/assets/chart-line.svg' />
					</div>
					: <div className={styles.links}>
						<NavLink name="My Home" href="/my-home" icon='/assets/house-user.svg' />
					</div>
					}

					<div className={styles.userBox}>
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
							{user.home !== "none" ? 
							(<div>
								<MenuItem onClick={handleCloseMenu}><Link href="/">My Home</Link></MenuItem>
								<MenuItem onClick={handleCloseMenu}><Link href="/to-do">To-Do</Link></MenuItem>
								<MenuItem onClick={handleCloseMenu}><Link href="/calendar">Calendar</Link></MenuItem>
								{/* <MenuItem onClick={handleCloseMenu}><Link href="/chat">Chat</Link></MenuItem> */}
								<MenuItem onClick={handleCloseMenu}><Link href="/finances">Finances</Link></MenuItem>
								{/* <MenuItem onClick={handleCloseMenu}><Link href="/analytics">Analytics</Link></MenuItem> */}
							</div>)
							: <div>
								<MenuItem onClick={handleCloseMenu}><Link href="/">My Home</Link></MenuItem>
							</div>}
						</Menu>

						<div className={styles.accountButtons}>
								<Link href="/login" className={`${styles.accountButton} ${styles.logoutButton}`} onClick={(event) => {
									window.sessionStorage.removeItem("userID");
								}}>Logout</Link>
								{/* <Link href="/login" className={styles.accountButton}> */}
								<div className={`${styles.accountButton} ${styles.accountIconButton}`}>
									<Avatar {...stringAvatar(user ? user.name : null, user ? user.color : 'gray')} />
								</div>
								{/* </Link> */}
							</div>
					</div>
				</div>
			</>
		)
	}
}