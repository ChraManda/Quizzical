import { useState } from 'react'
import styles from './ResultsScreen.module.css'

export default function ResultsScreen({ questions, userAnswers, onPlayAgain, onChangeCategory, onHome }) {
    const [showReview, setShowReview] = useState(false)
    const [filter, setFilter] = useState('all')

    const total = questions.length
    const score = questions.filter(q => userAnswers[q.id] === q.correctAnswer).length
    const percentage = Math.round((score / total) * 100)

    const radius = 65
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    let headline = 'Great Job!'
    if (percentage === 100) headline = 'Flawless Victory! 🏆'
    else if (percentage >= 80) headline = 'Outstanding Performance! 🌟'
    else if (percentage >= 50) headline = 'Good Effort! 👍'
    else headline = 'Keep Practicing! 💪'

    const filteredQuestions = questions.filter(q => {
        const userAns = userAnswers[q.id] || ''
        const isCorrect = userAns === q.correctAnswer
        if (filter === 'correct') return isCorrect
        if (filter === 'incorrect') return !isCorrect
        return true
    })

    return (
        <div className={styles.container}>
            <div className={styles.scoreCard}>
                <h1 className={styles.gradeHeadline}>{headline}</h1>

                <div className={styles.ringWrapper}>
                    <svg className={styles.ringSvg} viewBox="0 0 160 160">
                        <circle
                            className={styles.ringBg}
                            cx="80"
                            cy="80"
                            r={radius}
                        />
                        <circle
                            className={styles.ringFill}
                            cx="80"
                            cy="80"
                            r={radius}
                            style={{
                                strokeDasharray: circumference,
                                strokeDashoffset: strokeDashoffset
                            }}
                        />
                    </svg>
                    <div className={styles.ringTextContent}>
                        <span className={styles.percentageText}>{percentage}%</span>
                        <span className={styles.scoreRatioText}>{score} / {total} Correct</span>
                    </div>
                </div>

                <div className={styles.actionsRow}>
                    <button
                        type="button"
                        className={styles.playAgainBtn}
                        onClick={onPlayAgain}
                    >
                        Play Again
                    </button>
                    <button
                        type="button"
                        className={styles.changeCategoryBtn}
                        onClick={onChangeCategory}
                    >
                        Change Settings
                    </button>
                    <button
                        type="button"
                        className={styles.homeBtn}
                        onClick={onHome}
                    >
                        Home
                    </button>
                </div>
            </div>

            <div className={styles.reviewSection}>
                <button
                    type="button"
                    className={styles.toggleReviewBtn}
                    onClick={() => setShowReview(!showReview)}
                >
                    <span>Review Answers ({score}/{total} Correct)</span>
                    <span>{showReview ? '▴' : '▾'}</span>
                </button>

                {showReview && (
                    <>
                        <div className={styles.filterRow}>
                            <button
                                type="button"
                                className={`${styles.filterChip} ${filter === 'all' ? styles.filterChipActive : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All ({questions.length})
                            </button>
                            <button
                                type="button"
                                className={`${styles.filterChip} ${filter === 'correct' ? styles.filterChipActive : ''}`}
                                onClick={() => setFilter('correct')}
                            >
                                Correct ({score})
                            </button>
                            <button
                                type="button"
                                className={`${styles.filterChip} ${filter === 'incorrect' ? styles.filterChipActive : ''}`}
                                onClick={() => setFilter('incorrect')}
                            >
                                Incorrect ({total - score})
                            </button>
                        </div>

                        {filteredQuestions.map((q, idx) => {
                            const userAns = userAnswers[q.id] || 'No Answer'
                            const isCorrect = userAns === q.correctAnswer

                            return (
                                <div key={q.id} className={styles.questionReviewCard}>
                                    <div className={styles.reviewHeader}>
                                        <span className={styles.reviewQuestionText}>
                                            {questions.indexOf(q) + 1}. {q.question}
                                        </span>
                                        <span className={`${styles.statusBadge} ${
                                            isCorrect ? styles.statusCorrect : styles.statusWrong
                                        }`}>
                                            {isCorrect ? '✓ Correct' : '✕ Incorrect'}
                                        </span>
                                    </div>

                                    <div className={styles.reviewAnswers}>
                                        <div className={`${styles.answerRow} ${
                                            isCorrect ? styles.answerRowUserCorrect : styles.answerRowUserWrong
                                        }`}>
                                            <span className={styles.answerLabel}>Your Answer:</span>
                                            <span>{userAns}</span>
                                        </div>

                                        {!isCorrect && (
                                            <div className={`${styles.answerRow} ${styles.answerRowCorrectTarget}`}>
                                                <span className={styles.answerLabel}>Correct Answer:</span>
                                                <span>{q.correctAnswer}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        <div className={styles.bottomPlayAgainRow}>
                            <button
                                type="button"
                                className={styles.compactPlayAgainBtn}
                                onClick={onPlayAgain}
                            >
                                Play Again
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
