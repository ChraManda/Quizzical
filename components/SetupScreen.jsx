import { useState, useEffect, useRef, useActionState } from 'react'
import styles from './SetupScreen.module.css'

export default function SetupScreen({ onStartQuiz, initialConfig, quizError, onClearError }) {
    const [categories, setCategories] = useState([])
    const [catLoading, setCatLoading] = useState(true)
    const [catError, setCatError] = useState(null)
    
    const [category, setCategory] = useState(initialConfig?.category || 'any')
    const [difficulty, setDifficulty] = useState(initialConfig?.difficulty || 'any')
    const [amount, setAmount] = useState(initialConfig?.amount || 5)

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    const fetchCategories = async () => {
        setCatLoading(true)
        setCatError(null)
        try {
            const res = await fetch('https://opentdb.com/api_category.php')
            if (!res.ok) throw new Error('Failed to fetch categories')
            const data = await res.json()
            setCategories(data.trivia_categories || [])
        } catch (err) {
            setCatError('Could not load categories. Check network connection.')
        } finally {
            setCatLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const [, formAction, isPending] = useActionState(async (prevState, formData) => {
        if (onClearError) onClearError()
        const catVal = formData.get('category')
        const diffVal = formData.get('difficulty')
        const amtVal = Number(formData.get('amount')) || 5
        await onStartQuiz({ category: catVal, difficulty: diffVal, amount: amtVal })
        return null
    }, null)

    const selectedCatObj = categories.find(c => String(c.id) === String(category))
    const selectedLabel = catLoading 
        ? 'Loading categories...' 
        : (category === 'any' ? 'Any Category' : (selectedCatObj?.name || 'Any Category'))

    const handleSelectCategory = (val) => {
        setCategory(val)
        setIsDropdownOpen(false)
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Quizzical</h1>
                <p className={styles.subtitle}>Customize your quiz settings and test your knowledge</p>
            </div>

            <form action={formAction} className={styles.form}>
                {quizError && (
                    <div className={styles.errorMessage}>
                        <span>{quizError}</span>
                        {quizError.includes('Network') && (
                            <button 
                                type="button" 
                                className={styles.retryBtn}
                                onClick={onClearError}
                            >
                                Dismiss
                            </button>
                        )}
                    </div>
                )}

                {catError && (
                    <div className={styles.errorMessage}>
                        <span>{catError}</span>
                        <button 
                            type="button" 
                            className={styles.retryBtn} 
                            onClick={fetchCategories}
                        >
                            Retry Categories
                        </button>
                    </div>
                )}

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Category</label>
                    <input type="hidden" name="category" value={category} />

                    <div className={styles.customSelectWrapper} ref={dropdownRef}>
                        <button
                            type="button"
                            className={styles.customSelectTrigger}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            disabled={catLoading || isPending}
                            aria-haspopup="listbox"
                            aria-expanded={isDropdownOpen}
                        >
                            <span className={styles.customSelectText}>{selectedLabel}</span>
                            <span className={styles.customSelectArrow}>{isDropdownOpen ? '▴' : '▾'}</span>
                        </button>

                        {isDropdownOpen && (
                            <div className={styles.customOptionsPanel} role="listbox">
                                <button
                                    type="button"
                                    className={`${styles.customOption} ${
                                        category === 'any' ? styles.customOptionSelected : ''
                                    }`}
                                    onClick={() => handleSelectCategory('any')}
                                    role="option"
                                    aria-selected={category === 'any'}
                                >
                                    Any Category
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        className={`${styles.customOption} ${
                                            String(category) === String(cat.id) ? styles.customOptionSelected : ''
                                        }`}
                                        onClick={() => handleSelectCategory(String(cat.id))}
                                        role="option"
                                        aria-selected={String(category) === String(cat.id)}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Difficulty</label>
                    <input type="hidden" name="difficulty" value={difficulty} />
                    <div className={styles.optionsGrid}>
                        {['any', 'easy', 'medium', 'hard'].map((d) => (
                            <button
                                key={d}
                                type="button"
                                className={`${styles.segmentedBtn} ${
                                    difficulty === d ? styles.segmentedBtnActive : ''
                                }`}
                                onClick={() => setDifficulty(d)}
                                disabled={isPending}
                            >
                                {d.charAt(0).toUpperCase() + d.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Number of Questions</label>
                    <input type="hidden" name="amount" value={amount} />
                    <div className={styles.optionsGrid}>
                        {[5, 10, 15].map((n) => (
                            <button
                                key={n}
                                type="button"
                                className={`${styles.segmentedBtn} ${
                                    amount === n ? styles.segmentedBtnActive : ''
                                }`}
                                onClick={() => setAmount(n)}
                                disabled={isPending}
                            >
                                {n} Questions
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isPending || catLoading}
                >
                    {isPending ? 'Fetching Quiz...' : 'Start Quiz'}
                </button>
            </form>
        </div>
    )
}
