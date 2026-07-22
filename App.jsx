import { useState, useEffect } from 'react'
import { decode } from 'html-entities'
import { nanoid } from 'nanoid'
import SetupScreen from './components/SetupScreen'
import LoadingScreen from './components/LoadingScreen'
import QuizScreen from './components/QuizScreen'
import ResultsScreen from './components/ResultsScreen'

export default function App() {
    const [screen, setScreen] = useState('setup')
    const [quizConfig, setQuizConfig] = useState({
        category: 'any',
        difficulty: 'any',
        amount: 5
    })
    const [questions, setQuestions] = useState([])
    const [userAnswers, setUserAnswers] = useState({})
    const [quizError, setQuizError] = useState(null)
    const [noticeMessage, setNoticeMessage] = useState(null)
    const [sessionToken, setSessionToken] = useState(() => {
        return sessionStorage.getItem('quizzical_token') || ''
    })

    const fetchSessionToken = async () => {
        try {
            const res = await fetch('https://opentdb.com/api_token.php?command=request')
            const data = await res.json()
            if (data.response_code === 0 && data.token) {
                sessionStorage.setItem('quizzical_token', data.token)
                setSessionToken(data.token)
                return data.token
            }
        } catch (err) {
            console.error('Error fetching session token', err)
        }
        return ''
    }

    useEffect(() => {
        if (!sessionToken) {
            fetchSessionToken()
        }
    }, [])

    const resetTokenHistory = async (token) => {
        try {
            const res = await fetch(`https://opentdb.com/api_token.php?command=reset&token=${token}`)
            const data = await res.json()
            return data.response_code === 0
        } catch (err) {
            console.error('Error resetting token history', err)
            return false
        }
    }

    const shuffleArray = (array) => {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
    }

    const fetchQuizQuestions = async (config, isRetry = false) => {
        setQuizConfig(config)
        setQuizError(null)
        setScreen('loading')

        let currentToken = sessionToken || sessionStorage.getItem('quizzical_token')
        if (!currentToken) {
            currentToken = await fetchSessionToken()
        }

        let url = `https://opentdb.com/api.php?amount=${config.amount}&type=multiple`
        if (config.category && config.category !== 'any') {
            url += `&category=${config.category}`
        }
        if (config.difficulty && config.difficulty !== 'any') {
            url += `&difficulty=${config.difficulty}`
        }
        if (currentToken) {
            url += `&token=${currentToken}`
        }

        try {
            const res = await fetch(url)
            if (!res.ok) throw new Error('Network error during fetch')
            const data = await res.json()

            if (data.response_code === 0) {
                const formattedQuestions = data.results.map((q) => {
                    const decodedCorrect = decode(q.correct_answer)
                    const decodedIncorrect = q.incorrect_answers.map(a => decode(a))
                    const allAnswers = shuffleArray([...decodedIncorrect, decodedCorrect])

                    return {
                        id: nanoid(),
                        question: decode(q.question),
                        category: decode(q.category),
                        answers: allAnswers,
                        correctAnswer: decodedCorrect
                    }
                })

                setQuestions(formattedQuestions)
                setUserAnswers({})
                setNoticeMessage(null)
                setScreen('quiz')
            } else if (data.response_code === 1) {
                setQuizError('Not enough questions available for this combination, try a different difficulty or category')
                setNoticeMessage(null)
                setScreen('setup')
            } else if (data.response_code === 3) {
                if (!isRetry) {
                    sessionStorage.removeItem('quizzical_token')
                    setSessionToken('')
                    const newToken = await fetchSessionToken()
                    if (newToken) {
                        return fetchQuizQuestions(config, true)
                    }
                }
                setQuizError('Session expired. Please try again.')
                setNoticeMessage(null)
                setScreen('setup')
            } else if (data.response_code === 4) {
                if (!isRetry && currentToken) {
                    setNoticeMessage('Refreshing question pool...')
                    await resetTokenHistory(currentToken)
                    return fetchQuizQuestions(config, true)
                }
                setQuizError('All questions in this category have been viewed. Question pool reset, please try again.')
                setNoticeMessage(null)
                setScreen('setup')
            } else if (data.response_code === 5) {
                if (!isRetry) {
                    setNoticeMessage('Rate limit reached. Waiting a moment...')
                    await new Promise(r => setTimeout(r, 5000))
                    return fetchQuizQuestions(config, true)
                }
                setQuizError('Rate limit reached. Please wait a few seconds and try again.')
                setNoticeMessage(null)
                setScreen('setup')
            } else {
                setQuizError(`API returned response code ${data.response_code}. Please try different settings.`)
                setNoticeMessage(null)
                setScreen('setup')
            }
        } catch (err) {
            setQuizError('Network failure. Please check your connection and click Start Quiz to try again.')
            setNoticeMessage(null)
            setScreen('setup')
        }
    }

    const handleQuizSubmit = (answers) => {
        setUserAnswers(answers)
        setScreen('results')
    }

    const handlePlayAgain = () => {
        fetchQuizQuestions(quizConfig)
    }

    const handleChangeCategory = () => {
        setScreen('setup')
    }

    const handleHome = () => {
        setQuestions([])
        setUserAnswers({})
        setQuizError(null)
        setNoticeMessage(null)
        setScreen('setup')
    }

    return (
        <main>
            {screen === 'setup' && (
                <SetupScreen
                    onStartQuiz={fetchQuizQuestions}
                    initialConfig={quizConfig}
                    quizError={quizError}
                    onClearError={() => setQuizError(null)}
                />
            )}

            {screen === 'loading' && (
                <LoadingScreen noticeMessage={noticeMessage} />
            )}

            {screen === 'quiz' && (
                <QuizScreen
                    questions={questions}
                    onSubmitQuiz={handleQuizSubmit}
                />
            )}

            {screen === 'results' && (
                <ResultsScreen
                    questions={questions}
                    userAnswers={userAnswers}
                    onPlayAgain={handlePlayAgain}
                    onChangeCategory={handleChangeCategory}
                    onHome={handleHome}
                />
            )}
        </main>
    )
}