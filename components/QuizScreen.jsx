import { useState } from 'react'
import styles from './QuizScreen.module.css'

export default function QuizScreen({ questions, onSubmitQuiz }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [userAnswers, setUserAnswers] = useState({})

    const currentQuestion = questions[currentIndex]
    const totalQuestions = questions.length
    const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100)
    const currentSelected = userAnswers[currentQuestion.id]

    const handleSelectAnswer = (answerText) => {
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: answerText
        }))
    }

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
        }
    }

    const handleSubmit = () => {
        onSubmitQuiz(userAnswers)
    }

    const isAllAnswered = questions.every(q => userAnswers[q.id] !== undefined)

    return (
        <div className={styles.container}>
            <div className={styles.topBar}>
                <div className={styles.metaHeader}>
                    <span className={styles.counterText}>
                        Question {currentIndex + 1} of {totalQuestions}
                    </span>
                    {currentQuestion.category && (
                        <span className={styles.categoryTag} title={currentQuestion.category}>
                            {currentQuestion.category}
                        </span>
                    )}
                </div>
                <div className={styles.progressBarTrack}>
                    <div 
                        className={styles.progressBarFill} 
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            <div className={styles.card}>
                <h2 className={styles.questionText}>
                    {currentQuestion.question}
                </h2>

                <div className={styles.answerGrid}>
                    {currentQuestion.answers.map((ans, idx) => {
                        const isSelected = currentSelected === ans
                        return (
                            <button
                                key={idx}
                                type="button"
                                className={`${styles.answerCard} ${
                                    isSelected ? styles.answerCardSelected : ''
                                }`}
                                onClick={() => handleSelectAnswer(ans)}
                            >
                                <span>{ans}</span>
                                <div className={`${styles.radioIndicator} ${
                                    isSelected ? styles.radioIndicatorSelected : ''
                                }`}>
                                    {isSelected && <div className={styles.radioDot} />}
                                </div>
                            </button>
                        )
                    })}
                </div>

                <div className={styles.dotsRow}>
                    {questions.map((q, idx) => {
                        const isAnswered = userAnswers[q.id] !== undefined
                        const isActive = idx === currentIndex
                        return (
                            <button
                                key={q.id}
                                type="button"
                                aria-label={`Jump to question ${idx + 1}`}
                                className={`${styles.dot} ${
                                    isAnswered ? styles.dotAnswered : ''
                                } ${isActive ? styles.dotActive : ''}`}
                                onClick={() => setCurrentIndex(idx)}
                            />
                        )
                    })}
                </div>

                <div className={styles.navRow}>
                    <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                    >
                        Previous
                    </button>

                    {currentIndex < totalQuestions - 1 ? (
                        <button
                            type="button"
                            className={styles.primaryBtn}
                            onClick={handleNext}
                        >
                            Next Question
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={styles.primaryBtn}
                            onClick={handleSubmit}
                        >
                            Submit Quiz ({Object.keys(userAnswers).length}/{totalQuestions})
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
