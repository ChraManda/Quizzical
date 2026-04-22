import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { decode } from 'html-entities'
import { nanoid } from 'nanoid'
import { ThreeDots } from 'react-loader-spinner'
export default function App() {
    
    const [page, setPage] = useState('home')
    const [selectedAnswer, setSelectedAnswer] = useState({})
    const [quiz, setQuiz] = useState([])
    const [results, setResults] = useState({})
    const [isQuizOver, setIsQuizOver] = useState(false)
    const [loading, setLoading] = useState(true)
    
    useEffect( () => {
        getQuestions()
    }, [])
    
    const userScore = Object.values(results).filter( score => score === true).length
    
    function newQuiz () {
        page === 'home'? setPage('quiz') : page
        setSelectedAnswer({})
        setQuiz([])
        setResults({})
        getQuestions()
        setIsQuizOver(false)
    }
    function checkAnswers() {
        const result = Object.fromEntries(Object.entries(selectedAnswer).map(([id, answerIndex]) => {
            const question = quiz.find(q => q.id === id)
            const isCorrect = question.answers[answerIndex] === question.correctAns ? true : false
            return [id, isCorrect]
        }))
        setIsQuizOver(prev => prev === false? true: prev)
        setResults(result)
    }
    
   async function getQuestions() {
        setLoading(true)
        const response = await fetch('https://opentdb.com/api.php?amount=5&category=12&difficulty=medium&type=multiple')
        const data  = await response.json()
        if (!data.results) return
        const quizzes = data.results.map( quiz => {
            let allAnswers = [...quiz.incorrect_answers, quiz.correct_answer].map(a => decode(a))
            allAnswers.sort( () => Math.random() - 0.5)
            return({
                id: nanoid(), 
                question: decode(quiz.question),
                answers: allAnswers,
                correctAns: decode(quiz.correct_answer)
            })
        })
        setQuiz(quizzes)
        setLoading(false)
    }
    
    
 //Generating choices Element from API
    const choicesEl = quiz.map((question) => {
        const choices = question.answers.map((answer, index) => {
            const isSelected = selectedAnswer[question.id] === index
            const isCorrect = results[question.id] === true
            const isWrong = results[question.id] === false
            const correctIndex = question.answers.indexOf(question.correctAns)
            
            const btnClasses = clsx('quiz-btn', {
                'selected': isSelected,
                'correct': isQuizOver && (isCorrect && isSelected || index === correctIndex),
                'wrong': isQuizOver && isWrong && isSelected,
                'dimmed': isQuizOver && index !==correctIndex && (!isSelected || isWrong)
            })
                
            return (
                <button
                    key={index}
                    className={btnClasses}
                    onClick={() => setSelectedAnswer(prev => ({ ...prev, [question.id]: index }))}
                    disabled={isQuizOver && selectedAnswer[question.id] !== index}
                >
                    {answer}
                </button>
        )})
        return (
            <div key={question.id} className="quizzes">
                <h3 className='question'>{question.question}</h3>
                <div className='choices'>
                    {choices}
                </div>
            </div>
        )
    })
    
    return (
        <main className={page === 'home' ? 'home' : ''}>
            {page === 'home' && (
                <><div className='home-container'>
                    <h1>Quizzical</h1>
                    <p>Test your music knowledge with this Quizzes</p>
                    <button onClick={newQuiz}>Quiz</button>
                </div>
                </>
            )}
            {page === 'quiz' && (
                <>
                    <div className='quiz-container'>
                        {loading? <ThreeDots
                        height="80"
                        width="80"
                        radius="9"
                        color="#4D5B9E"
                        ariaLabel="three-dots-loading"
                        wrapperStyle={{ margin: '20px' }}
                        wrapperClass="custom-loader"
                        visible={true}
                        /> : (quiz.length > 0 && choicesEl)}
                        
                        <div className="feedback-check">
                            <div>
                                {isQuizOver && <h3>You Scored {userScore}/{quiz.length}</h3>}
                            </div>
                            <div>
                                {!isQuizOver && quiz.length !== 0 && Object.keys(selectedAnswer).length === quiz.length &&
                                    <button className='check-answers' onClick={checkAnswers}>
                                        Check answers
                                    </button>}
                                {isQuizOver &&
                                    <button className='check-answers' onClick={newQuiz}>
                                        New Quiz
                                    </button>}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </main>
    )
}