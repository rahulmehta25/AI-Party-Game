/**
 * AI Party Game - AI Trivia Mode
 * AI-generated questions that'll make you question everything!
 */

import { 
    GameState, 
    TRIVIA_CATEGORIES,
    getRandomItem, 
    shuffleArray,
    callAI,
    awardPoints
} from '../game-engine.js';
import { showToast, showWaitingUI, updateSubmittedList, stopTimer } from '../ui.js';
import { saveGameState, loadGameState, isDemoMode } from '../multiplayer.js';

// Reference to SoundFX
let SoundFX = null;

/**
 * Set the SoundFX reference
 * @param {Object} soundFxRef - SoundFX object
 */
export function setSoundFX(soundFxRef) {
    SoundFX = soundFxRef;
}

// ========================================
// FALLBACK TRIVIA QUESTIONS
// ========================================

const FALLBACK_QUESTIONS = [
    {
        category: "Space",
        question: "If you could hear sound in space, what would the Sun sound like?",
        options: ["Complete silence", "A deep roar", "A high-pitched whistle", "Crackling fire"],
        correct: 1,
        explanation: "Scientists converted the Sun's vibrations to sound - it would be a constant deep roar!"
    },
    {
        category: "Animals",
        question: "What's the only mammal that can't jump?",
        options: ["Elephant", "Hippo", "Rhino", "Sloth"],
        correct: 0,
        explanation: "Elephants are the only mammals that cannot jump. Their legs just aren't built for it!"
    },
    {
        category: "Food",
        question: "What was the original color of carrots before they were orange?",
        options: ["Purple", "White", "Yellow", "All of these"],
        correct: 3,
        explanation: "Carrots were purple, white, and yellow! Orange carrots were bred in the Netherlands in the 17th century."
    },
    {
        category: "Technology",
        question: "What was the first item ever sold on eBay?",
        options: ["A Beanie Baby", "A broken laser pointer", "A vintage watch", "A Pokemon card"],
        correct: 1,
        explanation: "In 1995, a broken laser pointer was sold for $14.83. The buyer knew it was broken!"
    },
    {
        category: "History",
        question: "Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid. True or false?",
        options: ["True", "False", "Trick question", "Depends on which pyramid"],
        correct: 0,
        explanation: "True! The Great Pyramid was built around 2560 BC. Cleopatra lived around 30 BC. The Moon landing was 1969."
    },
    {
        category: "Science",
        question: "What would happen if you put a spoonful of neutron star on Earth?",
        options: ["It would float", "Nothing special", "It would weigh ~6 billion tons", "It would explode"],
        correct: 2,
        explanation: "A teaspoon of neutron star would weigh about 6 billion tons! It's incredibly dense."
    },
    {
        category: "Pop Culture",
        question: "What was the first YouTube video ever uploaded about?",
        options: ["A cat video", "A music video", "The zoo", "A vlog"],
        correct: 2,
        explanation: "The first YouTube video was 'Me at the zoo' uploaded by co-founder Jawed Karim in 2005."
    },
    {
        category: "Nature",
        question: "How long is one day on Venus?",
        options: ["12 hours", "243 Earth days", "365 Earth days", "Same as Earth"],
        correct: 1,
        explanation: "Venus rotates so slowly that a day on Venus is longer than its year! (243 days vs 225 days)"
    },
    {
        category: "Random",
        question: "The inventor of the Pringles can is buried in one. True or false?",
        options: ["True", "False", "Partially true", "It's classified"],
        correct: 0,
        explanation: "True! Fredric Baur, who designed the Pringles can, had some of his ashes buried in one."
    },
    {
        category: "Technology",
        question: "What was Google's original name?",
        options: ["Backrub", "SearchPro", "WebCrawler", "PageRank"],
        correct: 0,
        explanation: "Google was originally called 'BackRub' because it analyzed back links. Much less catchy!"
    }
];

// ========================================
// TRIVIA INITIALIZATION
// ========================================

/**
 * Generate trivia questions (AI or fallback)
 */
export async function generateTriviaQuestions() {
    showToast('🤖 AI is generating trivia questions...', 'info');
    
    const result = await callAI('/api/generate-trivia', {
        count: GameState.settings.rounds,
        categories: shuffleArray(TRIVIA_CATEGORIES).slice(0, 4)
    });
    
    if (result && result.questions && result.questions.length > 0) {
        GameState.triviaQuestions = result.questions;
        GameState.currentQuestionIndex = 0;
        console.log('Using AI-generated trivia questions');
        return;
    }
    
    // Fallback to hardcoded questions
    console.log('Using fallback trivia questions');
    GameState.triviaQuestions = shuffleArray(FALLBACK_QUESTIONS).slice(0, GameState.settings.rounds);
    GameState.currentQuestionIndex = 0;
}

/**
 * Start a trivia round
 */
export function startTrivia() {
    const question = GameState.triviaQuestions[GameState.currentQuestionIndex];
    
    document.getElementById('trivia-category').textContent = question.category;
    document.getElementById('trivia-question').textContent = question.question;
    
    const optionsContainer = document.getElementById('trivia-options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'trivia-option';
        btn.textContent = option;
        btn.onclick = () => selectTriviaAnswer(index);
        optionsContainer.appendChild(btn);
    });
}

// ========================================
// ANSWER SELECTION
// ========================================

let onAnswerSelected = null;

/**
 * Handle trivia answer selection
 * @param {number} index - Index of selected answer
 */
export function selectTriviaAnswer(index) {
    // Remove previous selection
    document.querySelectorAll('.trivia-option').forEach(opt => opt.classList.remove('selected'));
    
    // Select this one
    document.querySelectorAll('.trivia-option')[index].classList.add('selected');
    
    GameState.answers[GameState.playerId] = {
        answer: index,
        playerId: GameState.playerId
    };
    
    if (SoundFX) SoundFX.play('click');
    saveGameState();
    
    // Auto-advance after selection
    setTimeout(() => {
        showWaitingUI();
        if (onAnswerSelected) onAnswerSelected();
    }, 500);
}

/**
 * Check if all players have submitted (for trivia)
 * @param {Function} onAllSubmitted - Callback when all have submitted
 */
export function checkAllSubmitted(onAllSubmitted) {
    onAnswerSelected = onAllSubmitted;
    
    if (isDemoMode()) {
        simulateAIPlayerAnswers();
    }
    
    loadGameState();
    updateSubmittedList();
    
    const allSubmitted = GameState.players.every(p => GameState.answers[p.id]);
    
    if (allSubmitted) {
        stopTimer();
        setTimeout(() => {
            showTriviaResults(onAllSubmitted);
        }, 1000);
    } else {
        setTimeout(() => checkAllSubmitted(onAllSubmitted), 1000);
    }
}

// ========================================
// RESULTS
// ========================================

/**
 * Show trivia results and advance
 * @param {Function} onComplete - Callback when results are shown
 */
export function showTriviaResults(onComplete) {
    const question = GameState.triviaQuestions[GameState.currentQuestionIndex];
    const options = document.querySelectorAll('.trivia-option');
    
    // Show correct/incorrect
    options.forEach((opt, index) => {
        if (index === question.correct) {
            opt.classList.add('correct');
        } else if (GameState.answers[GameState.playerId]?.answer === index) {
            opt.classList.add('incorrect');
        }
    });
    
    // Award points
    if (GameState.answers[GameState.playerId]?.answer === question.correct) {
        awardPoints(GameState.playerId, 100);
        showToast('Correct! +100 points! 🎉', 'success');
        if (SoundFX) SoundFX.play('correct');
    } else {
        showToast(`Wrong! It was: ${question.options[question.correct]}`, 'error');
        if (SoundFX) SoundFX.play('wrong');
    }
    
    saveGameState();
    
    // Note: For trivia, we pass null as winnerId since scoring is individual
    setTimeout(() => {
        if (onComplete) onComplete(null);
    }, 2500);
}

/**
 * Advance to next question
 */
export function advanceQuestion() {
    GameState.currentQuestionIndex++;
}

// ========================================
// DEMO MODE AI SIMULATION
// ========================================

/**
 * Simulate AI player answers in demo mode
 */
function simulateAIPlayerAnswers() {
    if (!isDemoMode()) return;
    
    const question = GameState.triviaQuestions[GameState.currentQuestionIndex];
    
    GameState.players.forEach(player => {
        if (player.id !== GameState.playerId && !GameState.answers[player.id]) {
            setTimeout(() => {
                // AI players have 70% chance of getting correct answer
                const isCorrect = Math.random() < 0.7;
                const answer = isCorrect ? question.correct : Math.floor(Math.random() * 4);
                
                GameState.answers[player.id] = {
                    answer: answer,
                    playerId: player.id
                };
                
                if (answer === question.correct) {
                    awardPoints(player.id, 100);
                }
                
                saveGameState();
            }, 1000 + Math.random() * 3000);
        }
    });
}
