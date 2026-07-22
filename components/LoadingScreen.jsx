import { ThreeDots } from 'react-loader-spinner'
import styles from './LoadingScreen.module.css'

export default function LoadingScreen({ noticeMessage }) {
    return (
        <div className={styles.container}>
            <div className={styles.spinnerContainer}>
                <ThreeDots
                    height="60"
                    width="60"
                    radius="9"
                    color="#00B4D8"
                    ariaLabel="loading-quiz-questions"
                    visible={true}
                />
                <span className={styles.spinnerText}>
                    {noticeMessage || 'Preparing Your Quiz...'}
                </span>
            </div>

            <div className={styles.skeletonContainer}>
                <div className={styles.skeletonCard}>
                    <div className={`${styles.skeletonLine} ${styles.skeletonShort}`}></div>
                    <div className={`${styles.skeletonLine} ${styles.skeletonFull}`}></div>
                    <div className={styles.skeletonAnswers}>
                        <div className={styles.skeletonAnswer}></div>
                        <div className={styles.skeletonAnswer}></div>
                        <div className={styles.skeletonAnswer}></div>
                        <div className={styles.skeletonAnswer}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
