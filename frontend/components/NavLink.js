import Link from 'next/link'
import Image from 'next/image'
import styles from '../styles/NavLink.module.css'

export default function NavLink({ name, href, icon }) {
  return (
    <div >
      <Link className={styles.container} href={href}>
        <Image src={icon} alt={name} width="48" height="48" />
        {name}
      </Link>
    </div>
  )
}