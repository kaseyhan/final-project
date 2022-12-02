import { useEffect, useState } from 'react';
import NavLink from './NavLink'
import Link from 'next/link';
import Image from 'next/image';
import Avatar from '@mui/material/Avatar';
import { Menu, MenuItem, IconButton } from '@mui/material'
import { FaBars } from 'react-icons/fa';
import { RxCross1 } from 'react-icons/rx'


import styles from '../styles/Navbar.module.css'
// icons by IconScout/unicon

// cite: https://mui.com/material-ui/react-avatar/
function stringToColor(string) {
	let hash = 0;
	let i;

	/* eslint-disable no-bitwise */
	for (i = 0; i < string.length; i += 1) {
		hash = string.charCodeAt(i) + ((hash << 5) - hash);
	}

	let color = '#';

	for (i = 0; i < 3; i += 1) {
		const value = (hash >> (i * 8)) & 0xff;
		color += `00${value.toString(16)}`.slice(-2);
	}
	/* eslint-enable no-bitwise */
	console.log(color)
	return color;
}

// cite: https://mui.com/material-ui/react-avatar/
function stringAvatar(name) {
	return {
		sx: {
			bgcolor: stringToColor(name),
			width: 48,
			height: 48
		},
		children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
	};
}


export default function Navbar() {
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);
	const handleOpenMenu = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleCloseMenu = () => {
		setAnchorEl(null);
	};

	return (
		<>
			<div className={styles.navbar}>
				<div className={styles.logoBox}>
					<Link href="/">
						<Image src="/assets/logo.png" width='200' height='60' />
					</Link>
				</div>
				<div className={styles.links}>
					<NavLink name="My Home" href="/" icon='/assets/house-user.svg' />
					<NavLink name="To-Do" href="/to-do" icon='/assets/list-ul.svg' />
					<NavLink name="Calendar" href="/calendar" icon='/assets/schedule.svg' />
					<NavLink name="Chat" href="/chat" icon='/assets/comments-alt.svg' />
					<NavLink name="Finances" href="/finances" icon='/assets/dollar-alt.svg' />
					<NavLink name="Analytics" href="/analytics" icon='/assets/chart-line.svg' />
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
						<MenuItem onClick={handleCloseMenu}><Link href="/chat">Chat</Link></MenuItem>
						<MenuItem onClick={handleCloseMenu}><Link href="/finances">Finances</Link></MenuItem>
						<MenuItem onClick={handleCloseMenu}><Link href="/analytics">Analytics</Link></MenuItem>
					</Menu>

					<Link href="/login">
						<Avatar {...stringAvatar('Test User')} />
					</Link>
				</div>
			</div>
		</>
	)
}