/**
 * AI Party Game - Story Builder Mode
 * Collaborate to create the weirdest story ever told!
 */

import { 
    GameState, 
    PROMPTS, 
    STORY_STARTERS,
    AI_JUDGMENTS,
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
// STORY BUILDER INITIALIZATION
// ========================================

/**
 * Initialize story with a random starter
 */
export function initializeStory() {
    GameState.story = [getRandomItem(STORY_STARTERS)];
    saveGameState();
}

/**
 * Start a Story Builder round
 */
export function startStoryBuilder() {
    document.getElementById('story-text').textContent = GameState.story.join(' ');
    
    const promptText = getRandomItem(PROMPTS['story-builder']);
    document.getElementById('story-prompt-text').textContent = promptText;
    
    document.getElementById('story-input').value = '';
    document.getElementById('story-char-count').textContent = '0';
    
    // Setup character counter
    const storyInput = document.getElementById('story-input');
    storyInput.oninput = function() {
        document.getElementById('story-char-count').textContent = this.value.length;
    };
    
    saveGameState();
}

// ========================================
// STORY SUBMISSION
// ========================================

/**
 * Submit story contribution
 */
export function submitStoryPart() {
    const part = document.getElementById('story-input').value.trim();
    
    if (!part) {
        showToast('Add something to the story!', 'error');
        return;
    }
    
    submitStoryPartInternal(part);
}

/**
 * Internal story submission (also used for auto-submit on timeout)
 * @param {string} part - The story contribution
 */
export function submitStoryPartInternal(part) {
    GameState.answers[GameState.playerId] = {
        text: part,
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
 * Start the judging phase for story contributions
 * @param {Function} onComplete - Callback when judging is complete with winnerId
 */
export function startJudging(onComplete) {
    showScreen('judging-screen');
    
    // For story mode, show the story prompt instead of a generic prompt
    const storyPrompt = document.getElementById('story-prompt-text')?.textContent || 'continue the story';
    document.getElementById('judging-prompt').textContent = `Continue with: ${storyPrompt}`;
    
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
 * Cast a vote for a story contribution
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
    
    // Add winning story part to the story
    addWinningPartToStory(winnerId);
    
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
 * Have AI judge the story contributions
 * @param {Function} onComplete - Callback with winnerId
 */
async function performAIJudging(onComplete) {
    const answers = Object.values(GameState.answers);
    const judgmentEl = document.getElementById('ai-judgment');
    
    judgmentEl.textContent = "🤔 Analyzing story contributions...";
    
    let winnerId = null;
    let judgment = null;
    
    const storyPrompt = document.getElementById('story-prompt-text')?.textContent || 'continue the story';
    
    const result = await callAI('/api/judge-story', {
        currentStory: GameState.story.join(' '),
        storyPrompt: storyPrompt,
        contributions: answers.map(a => ({
            playerId: a.playerId,
            playerName: a.playerName,
            text: a.text
        }))
    });
    
    if (result) {
        winnerId = result.winnerId;
        judgment = result.judgment;
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
    
    // Add winning story part
    addWinningPartToStory(winnerId);
    
    saveGameState();
    
    if (SoundFX) SoundFX.play('winner');
    
    setTimeout(() => {
        if (onComplete) onComplete(winnerId);
    }, 3000);
}

// ========================================
// STORY MANAGEMENT
// ========================================

/**
 * Add the winning contribution to the story
 * @param {string} winnerId - ID of the winning player
 */
function addWinningPartToStory(winnerId) {
    const winningPart = GameState.answers[winnerId]?.text || '';
    if (winningPart) {
        GameState.story.push(winningPart);
    }
}

/**
 * Get the complete story
 * @returns {string} The full story text
 */
export function getCompleteStory() {
    return GameState.story.join(' ');
}

// ========================================
// DEMO MODE AI SIMULATION
// ========================================

const DEMO_STORY_ANSWERS = [
    "Suddenly, a rubber duck appeared wearing a tiny crown.",
    "The protagonist realized they had been a toaster all along.",
    "Everything went silent except for a distant 'meow'.",
    "A mysterious fog rolled in, smelling suspiciously like pizza.",
    "The ground opened up to reveal... a very confused accountant.",
    "Time froze, but someone's ringtone kept playing anyway.",
    "A voice from nowhere said 'Have you tried turning it off and on again?'",
    "The hero tripped over nothing and discovered the meaning of life."
];

/**
 * Simulate AI player answers in demo mode
 */
export function simulateAIPlayerAnswers() {
    if (!isDemoMode()) return;
    
    GameState.players.forEach(player => {
        if (player.id !== GameState.playerId && !GameState.answers[player.id]) {
            setTimeout(() => {
                GameState.answers[player.id] = {
                    text: getRandomItem(DEMO_STORY_ANSWERS),
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
