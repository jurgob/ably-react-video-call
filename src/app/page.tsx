import styles from './page.module.css'
import Video from './Video'
export default function Home() {
  console.log('HOME')
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <Video />
      </div>
    </main>
  )
}
