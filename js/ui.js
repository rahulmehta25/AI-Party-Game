/**
 * AI Party Game - UI Module
 * DOM manipulation, animations, toasts, and screen navigation
 */

import { GameState, getSortedPlayersByScore, AI_JUDGMENTS } from './game-engine.js';

// Reference to SoundFX (will be set by main.js)
let SoundFX = null;

/**
 * Set the SoundFX reference
 * @param {Object} soundFxRef - SoundFX object
 */
export function setSoundFX(soundFxRef) {
    SoundFX = soundFxRef;
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type: 'info', 'success', 'error'
 */
export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    if (SoundFX) SoundFX.play('notification');
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ========================================
// SCREEN NAVIGATION
// ========================================

/**
 * Show a specific screen and hide others
 * @param {string} screenId - ID of screen to show
 */
export function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        if (SoundFX) SoundFX.play('transition');
    }
}

// ========================================
// TIMER
// ========================================

let timerInterval = null;
let timeRemaining = 60;
let onTimeUpCallback = null;

/**
 * Start the game timer
 * @param {Function} onTimeUp - Callback when time runs out
 */
export function startTimer(onTimeUp) {
    onTimeUpCallback = onTimeUp;
    timeRemaining = GameState.settings.timeLimit;
    const timerEl = document.getElementById('timer');
    const progressEl = document.getElementById('timer-progress');
    const circumference = 2 * Math.PI * 45;
    
    timerEl.textContent = timeRemaining;
    timerEl.className = 'timer';
    progressEl.style.strokeDashoffset = 0;
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        timerEl.textContent = timeRemaining;
        
        const progress = (1 - timeRemaining / GameState.settings.timeLimit) * circumference;
        progressEl.style.strokeDashoffset = progress;
        
        if (timeRemaining <= 10) {
            timerEl.className = 'timer danger';
            if (timeRemaining === 10 && SoundFX) SoundFX.play('warning');
        } else if (timeRemaining <= 20) {
            timerEl.className = 'timer warning';
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            if (SoundFX) SoundFX.play('timeUp');
            if (onTimeUpCallback) onTimeUpCallback();
        }
    }, 1000);
}

/**
 * Stop the timer
 */
export function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// ========================================
// WAITING UI
// ========================================

/**
 * Show the waiting UI while other players submit
 */
export function showWaitingUI() {
    document.querySelectorAll('.game-mode-ui').forEach(ui => ui.style.display = 'none');
    document.getElementById('waiting-ui').style.display = 'flex';
    updateSubmittedList();
}

/**
 * Update the list showing who has submitted
 */
export function updateSubmittedList() {
    const list = document.getElementById('submitted-players');
    list.innerHTML = '';
    
    GameState.players.forEach(player => {
        const div = document.createElement('div');
        div.className = 'submitted-player';
        const submitted = GameState.answers[player.id];
        div.innerHTML = `
            <span>${player.avatar} ${player.name}</span>
            <span class="check">${submitted ? '✓' : '...'}</span>
        `;
        list.appendChild(div);
    });
}

// ========================================
// GAME HEADER
// ========================================

/**
 * Update the game header display
 */
export function updateGameHeader() {
    document.getElementById('current-round').textContent = GameState.currentRound;
    document.getElementById('total-rounds').textContent = GameState.settings.rounds;
    document.getElementById('current-score').textContent = GameState.scores[GameState.playerId] || 0;
}

// ========================================
// STANDINGS DISPLAY
// ========================================

/**
 * Render standings list in a container
 * @param {string} containerId - ID of container element
 */
export function renderStandings(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    const sortedPlayers = getSortedPlayersByScore();
    
    sortedPlayers.forEach((player, index) => {
        const row = document.createElement('div');
        row.className = 'standing-row';
        row.innerHTML = `
            <span class="standing-rank">${index + 1}</span>
            <span class="standing-name">${player.avatar} ${player.name}</span>
            <span class="standing-score">${GameState.scores[player.id] || 0}</span>
        `;
        container.appendChild(row);
    });
}

// ========================================
// ROUND RESULTS
// ========================================

/**
 * Display round results
 * @param {string} winnerId - ID of the round winner
 * @param {Function} onNext - Callback for next round (host only)
 */
export function displayRoundResults(winnerId, onNext) {
    showScreen('round-results');
    
    const winner = GameState.players.find(p => p.id === winnerId);
    const winningAnswer = GameState.answers[winnerId];
    
    document.getElementById('round-winner').textContent = winner?.name || 'Unknown';
    document.getElementById('winning-answer').textContent = `"${winningAnswer?.text || '...'}"`;
    document.getElementById('points-earned').textContent = '100';
    
    // AI commentary
    const commentary = getRandomJudgment();
    document.getElementById('ai-comment').textContent = commentary;
    
    renderStandings('standings-list');
    updateGameHeader();
    
    const nextBtn = document.getElementById('next-round-btn');
    if (GameState.isHost) {
        nextBtn.style.display = 'block';
        nextBtn.onclick = onNext;
    } else {
        nextBtn.style.display = 'none';
    }
}

/**
 * Get a random positive judgment for display
 * @returns {string} Random judgment text
 */
function getRandomJudgment() {
    const allGood = [...AI_JUDGMENTS.good, ...AI_JUDGMENTS.winner];
    return allGood[Math.floor(Math.random() * allGood.length)];
}

// ========================================
// FINAL RESULTS
// ========================================

/**
 * Display final game results
 */
export function displayFinalResults() {
    showScreen('final-results');
    if (SoundFX) SoundFX.play('gameEnd');
    
    const sortedPlayers = getSortedPlayersByScore();
    
    // Podium
    if (sortedPlayers[0]) {
        document.getElementById('first-place').textContent = sortedPlayers[0].name;
        document.getElementById('first-score').textContent = GameState.scores[sortedPlayers[0].id] || 0;
    }
    if (sortedPlayers[1]) {
        document.getElementById('second-place').textContent = sortedPlayers[1].name;
        document.getElementById('second-score').textContent = GameState.scores[sortedPlayers[1].id] || 0;
    }
    if (sortedPlayers[2]) {
        document.getElementById('third-place').textContent = sortedPlayers[2].name;
        document.getElementById('third-score').textContent = GameState.scores[sortedPlayers[2].id] || 0;
    }
    
    renderStandings('final-scores-list');
    
    // Stats
    document.getElementById('stat-rounds').textContent = GameState.settings.rounds;
    document.getElementById('stat-answers').textContent = GameState.players.length * GameState.settings.rounds;
}

/**
 * Display story mode final results
 */
export function displayStoryResults() {
    showScreen('story-results');
    if (SoundFX) SoundFX.play('gameEnd');
    
    document.getElementById('complete-story').textContent = GameState.story.join(' ');
    
    const contributorsList = document.getElementById('contributors-list');
    contributorsList.innerHTML = '';
    
    GameState.players.forEach(player => {
        const div = document.createElement('div');
        div.className = 'contributor';
        div.textContent = `${player.avatar} ${player.name}`;
        contributorsList.appendChild(div);
    });
}

// ========================================
// VOICE INPUT
// ========================================

let recognition = null;
let isRecording = false;

/**
 * Toggle voice input on/off
 * @param {string} inputId - ID of the target input element
 * @param {string} countId - ID of the character count element
 */
export function toggleVoiceInput(inputId, countId) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showToast('Voice input not supported in this browser', 'error');
        return;
    }
    
    if (isRecording) {
        stopRecording();
    } else {
        startRecording(inputId, countId);
    }
}

function startRecording(inputId, countId) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    
    const targetInput = document.getElementById(inputId);
    
    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        targetInput.value = transcript;
        document.getElementById(countId).textContent = transcript.length;
    };
    
    recognition.onend = () => stopRecording();
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopRecording();
        showToast('Voice input error. Try again!', 'error');
    };
    
    recognition.start();
    isRecording = true;
    
    const btn = document.getElementById('voice-btn') || document.getElementById('story-voice-btn');
    if (btn) {
        btn.classList.add('recording');
        btn.textContent = '🔴 Recording...';
    }
    
    if (SoundFX) SoundFX.play('click');
}

function stopRecording() {
    if (recognition) {
        recognition.stop();
    }
    isRecording = false;
    
    const btn = document.getElementById('voice-btn') || document.getElementById('story-voice-btn');
    if (btn) {
        btn.classList.remove('recording');
        btn.textContent = '🎤 Voice';
    }
}

/**
 * Check if currently recording
 * @returns {boolean} Recording state
 */
export function isVoiceRecording() {
    return isRecording;
}
