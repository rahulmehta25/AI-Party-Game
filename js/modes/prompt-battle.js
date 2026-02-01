/**
 * AI Party Game - Prompt Battle Mode
 * Answer funny prompts, AI judges the chaos!
 */

import { 
    GameState, 
    PROMPTS, 
    AI_JUDGMENTS, 
    AI_DEMO_ANSWERS,
    getRandomItem, 
    shuffleArray,
    callAI,
    awardPoints
} from '../game-engine.js';
import { showToast, showScreen, showWaitingUI, updateSubmittedList, stopTimer } from '../ui.js';
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
// PROMPT BATTLE INITIALIZATION
// ========================================

/**
 * Initialize and start a Prompt Battle round
 */
export function startPromptBattle() {
    const prompts = PROMPTS['prompt-battle'];
    GameState.currentPrompt = getRandomItem(prompts);
    
    document.getElementById('current-prompt').textContent = GameState.currentPrompt;
    document.getElementById('player-answer').value = '';
    document.getElementById('char-count').textContent = '0';
    
    // Setup character counter
    const answerInput = document.getElementById('player-answer');
    answerInput.oninput = function() {
        document.getElementById('char-count').textContent = this.value.length;
    };
    
    saveGameState();
}

// ========================================
// ANSWER SUBMISSION
// ========================================

/**
 * Submit the player's answer
 */
export function submitAnswer() {
    const answer = document.getElementById('player-answer').value.trim();
    
    if (!answer) {
        showToast('Write something first!', 'error');
        return;
    }
    
    submitAnswerInternal(answer);
}

/**
 * Internal answer submission (also used for auto-submit on timeout)
 * @param {string} answer - The answer text
 */
export function submitAnswerInternal(answer) {
    GameState.answers[GameState.playerId] = {
        text: answer,
        playerId: GameState.playerId,
        playerName: GameState.players.find(p => p.id === GameState.playerId)?.name || 'Unknown'
    };
    
    saveGameState();
    showWaitingUI();
}

// ========================================
// JUDGING PHASE
// ========================================

/**
 * Start the judging phase
 * @param {Function} onComplete - Callback when judging is complete with winnerId
 */
export function startJudging(onComplete) {
    showScreen('judging-screen');
    
    document.getElementById('judging-prompt').textContent = GameState.currentPrompt;
    
    const answersContainer = document.getElementById('answers-to-judge');
    answersContainer.innerHTML = '';
    
    const answers = Object.values(GameState.answers);
    const shuffledAnswers = shuffleArray(answers);
    
    shuffledAnswers.forEach((answer) => {
        const card = document.createElement('div');
        card.className = 'answer-card votable';
        card.dataset.playerId = answer.playerId;
        card.innerHTML = `
            <div class="answer-content">"${answer.text}"</div>
            <div class="answer-author">— ${answer.playerName}</div>
            <div class="answer-votes" style="display: none;">
                <span>❤️</span> <span class="vote-count">0</span> votes
            </div>
        `;
        
        if (answer.playerId !== GameState.playerId) {
            card.onclick = () => voteForAnswer(answer.playerId, onComplete);
        } else {
            card.classList.remove('votable');
            card.style.opacity = '0.6';
        }
        
        answersContainer.appendChild(card);
    });
    
    // AI judges for 2 players, player voting for 3+
    if (GameState.players.length <= 2) {
        document.getElementById('ai-judging').style.display = 'flex';
        document.getElementById('player-voting').style.display = 'none';
        
        setTimeout(() => {
            performAIJudging(onComplete);
        }, 2000);
    } else {
        document.getElementById('ai-judging').style.display = 'none';
        document.getElementById('player-voting').style.display = 'block';
    }
}

// ========================================
// VOTING
// ========================================

let onJudgingComplete = null;

/**
 * Cast a vote for an answer
 * @param {string} playerId - Player ID to vote for
 * @param {Function} onComplete - Callback when voting is complete
 */
function voteForAnswer(playerId, onComplete) {
    if (playerId === GameState.playerId) return;
    if (GameState.votes[GameState.playerId]) return;
    
    onJudgingComplete = onComplete;
    
    GameState.votes[GameState.playerId] = playerId;
    saveGameState();
    
    document.querySelectorAll('.answer-card').forEach(card => {
        if (card.dataset.playerId === playerId) {
            card.classList.add('voted');
        }
    });
    
    if (SoundFX) SoundFX.play('vote');
    showToast('Vote cast! 🗳️', 'success');
    
    checkAllVoted();
}

/**
 * Check if all players have voted
 */
export function checkAllVoted() {
    loadGameState();
    
    // In demo mode, simulate AI player votes
    if (isDemoMode()) {
        simulateAIVotes();
    }
    
    const votingPlayers = GameState.players.filter(p => GameState.answers[p.id]);
    const allVoted = votingPlayers.every(p => GameState.votes[p.id]);
    
    if (allVoted) {
        tallyVotesAndShowResults();
    } else {
        setTimeout(checkAllVoted, 1000);
    }
}

/**
 * Simulate votes from AI players in demo mode
 */
function simulateAIVotes() {
    GameState.players.forEach(player => {
        if (player.id !== GameState.playerId && !GameState.votes[player.id]) {
            const otherPlayers = GameState.players.filter(p => p.id !== player.id);
            const votedFor = getRandomItem(otherPlayers);
            GameState.votes[player.id] = votedFor.id;
        }
    });
    saveGameState();
}

/**
 * Tally votes and determine winner
 */
function tallyVotesAndShowResults() {
    const voteCounts = {};
    
    Object.values(GameState.votes).forEach(votedFor => {
        voteCounts[votedFor] = (voteCounts[votedFor] || 0) + 1;
    });
    
    let winnerId = null;
    let maxVotes = 0;
    
    Object.entries(voteCounts).forEach(([playerId, count]) => {
        if (count > maxVotes) {
            maxVotes = count;
            winnerId = playerId;
        }
    });
    
    if (!winnerId) {
        winnerId = getRandomItem(Object.keys(GameState.answers));
    }
    
    const points = 100 + (maxVotes * 25);
    awardPoints(winnerId, points);
    saveGameState();
    
    // Show votes on cards
    document.querySelectorAll('.answer-card').forEach(card => {
        const playerId = card.dataset.playerId;
        const votes = voteCounts[playerId] || 0;
        const votesDiv = card.querySelector('.answer-votes');
        votesDiv.style.display = 'flex';
        votesDiv.querySelector('.vote-count').textContent = votes;
    });
    
    if (SoundFX) SoundFX.play('winner');
    
    setTimeout(() => {
        if (onJudgingComplete) onJudgingComplete(winnerId);
    }, 2000);
}

// ========================================
// AI JUDGING
// ========================================

/**
 * Have AI judge the answers
 * @param {Function} onComplete - Callback with winnerId
 */
async function performAIJudging(onComplete) {
    const answers = Object.values(GameState.answers);
    const judgmentEl = document.getElementById('ai-judgment');
    
    judgmentEl.textContent = "🤔 Analyzing responses...";
    
    let winnerId = null;
    let judgment = null;
    
    const result = await callAI('/api/judge-prompt-battle', {
        prompt: GameState.currentPrompt,
        answers: answers.map(a => ({
            playerId: a.playerId,
            playerName: a.playerName,
            text: a.text
        }))
    });
    
    if (result) {
        winnerId = result.winnerId;
        judgment = result.judgment;
        
        if (result.scores) {
            answers.forEach((answer, i) => {
                const bonus = Math.floor((result.scores[i] || 50) / 10);
                awardPoints(answer.playerId, bonus);
            });
        }
    }
    
    // Fallback to random if AI failed
    if (!winnerId) {
        const winner = getRandomItem(answers);
        winnerId = winner.playerId;
        judgment = getRandomItem(AI_JUDGMENTS.winner);
        console.log('Using fallback random judging');
    }
    
    judgmentEl.textContent = judgment;
    awardPoints(winnerId, 100);
    saveGameState();
    
    if (SoundFX) SoundFX.play('winner');
    
    setTimeout(() => {
        if (onComplete) onComplete(winnerId);
    }, 3000);
}

// ========================================
// DEMO MODE AI SIMULATION
// ========================================

/**
 * Simulate AI player answers in demo mode
 */
export function simulateAIPlayerAnswers() {
    if (!isDemoMode()) return;
    
    GameState.players.forEach(player => {
        if (player.id !== GameState.playerId && !GameState.answers[player.id]) {
            setTimeout(() => {
                GameState.answers[player.id] = {
                    text: getRandomItem(AI_DEMO_ANSWERS),
                    playerId: player.id,
                    playerName: player.name
                };
                saveGameState();
            }, 2000 + Math.random() * 5000);
        }
    });
}

/**
 * Check if all players have submitted (with demo simulation)
 * @param {Function} onAllSubmitted - Callback when all have submitted
 */
export function checkAllSubmitted(onAllSubmitted) {
    if (isDemoMode()) {
        simulateAIPlayerAnswers();
    }
    
    loadGameState();
    updateSubmittedList();
    
    const allSubmitted = GameState.players.every(p => GameState.answers[p.id]);
    
    if (allSubmitted) {
        stopTimer();
        setTimeout(() => {
            if (onAllSubmitted) onAllSubmitted();
        }, 1000);
    } else {
        setTimeout(() => checkAllSubmitted(onAllSubmitted), 1000);
    }
}
