/**
 * AI Party Game - Main Entry Point
 * Initialization and game flow coordination
 */

import { 
    GameState, 
    resetGameState, 
    STORY_STARTERS,
    getRandomItem,
    initializeScores
} from './game-engine.js';

import { 
    showScreen, 
    showToast, 
    startTimer, 
    stopTimer,
    showWaitingUI,
    updateGameHeader,
    displayRoundResults,
    displayFinalResults,
    displayStoryResults,
    toggleVoiceInput,
    setSoundFX as setUISoundFX
} from './ui.js';

import { 
    createGame as mpCreateGame,
    joinGame as mpJoinGame,
    saveGameState,
    loadGameState,
    clearGameState,
    updateLobbyUI,
    startLobbyPolling,
    stopLobbyPolling,
    copyRoomCode,
    pollForNextRound,
    startDemoMode as mpStartDemoMode,
    isDemoMode,
    setSoundFX as setMPSoundFX
} from './multiplayer.js';

import * as PromptBattle from './modes/prompt-battle.js';
import * as StoryBuilder from './modes/story-builder.js';
import * as Trivia from './modes/trivia.js';

// ========================================
// SOUND EFFECTS INTEGRATION
// ========================================

// SoundFX is loaded from sounds.js (non-module script)
let SoundFX = null;

/**
 * Initialize SoundFX references across all modules
 */
function initSoundFX() {
    if (window.SoundFX) {
        SoundFX = window.SoundFX;
        setUISoundFX(SoundFX);
        setMPSoundFX(SoundFX);
        PromptBattle.setSoundFX(SoundFX);
        StoryBuilder.setSoundFX(SoundFX);
        Trivia.setSoundFX(SoundFX);
    }
}

// ========================================
// GAME MODE SELECTION
// ========================================

let selectedMode = 'prompt-battle';

/**
 * Select a game mode
 * @param {string} mode - Mode to select
 */
window.selectMode = function(mode) {
    selectedMode = mode;
    GameState.currentMode = mode;
    
    document.querySelectorAll('.mode-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('selected');
    }
    
    if (SoundFX) SoundFX.play('click');
};

/**
 * Adjust round count
 * @param {number} delta - Amount to adjust by
 */
window.adjustRounds = function(delta) {
    const countEl = document.getElementById('round-count');
    let count = parseInt(countEl.textContent);
    count = Math.max(1, Math.min(10, count + delta));
    countEl.textContent = count;
    GameState.settings.rounds = count;
    if (SoundFX) SoundFX.play('click');
};

// ========================================
// GAME CREATION & JOINING
// ========================================

window.createGame = function() {
    mpCreateGame(() => {
        startLobbyPolling(startGameForPlayer);
    });
};

window.joinGame = function() {
    mpJoinGame(() => {
        startLobbyPolling(startGameForPlayer);
    });
};

window.copyRoomCode = copyRoomCode;

// ========================================
// GAME START
// ========================================

/**
 * Start the game (host only)
 */
window.startGame = async function() {
    if (GameState.players.length < 2) {
        showToast('Need at least 2 players!', 'error');
        return;
    }
    
    GameState.gamePhase = 'playing';
    GameState.currentRound = 1;
    GameState.answers = {};
    GameState.votes = {};
    
    initializeScores();
    
    // Initialize mode-specific data
    if (GameState.currentMode === 'story-builder') {
        StoryBuilder.initializeStory();
    } else if (GameState.currentMode === 'ai-trivia') {
        await Trivia.generateTriviaQuestions();
    }
    
    saveGameState();
    startGameForPlayer();
};

/**
 * Start the game for the current player
 */
function startGameForPlayer() {
    showScreen('game-screen');
    stopLobbyPolling();
    
    // Show correct mode UI
    document.getElementById('prompt-battle-ui').style.display = 'none';
    document.getElementById('story-builder-ui').style.display = 'none';
    document.getElementById('ai-trivia-ui').style.display = 'none';
    
    const modeUI = document.getElementById(`${GameState.currentMode}-ui`);
    if (modeUI) modeUI.style.display = 'flex';
    
    updateGameHeader();
    startRound();
}

// ========================================
// ROUND MANAGEMENT
// ========================================

/**
 * Start a new round
 */
function startRound() {
    GameState.answers = {};
    GameState.votes = {};
    saveGameState();
    
    // Hide waiting UI
    document.getElementById('waiting-ui').style.display = 'none';
    
    // Show game mode UI
    const modeUI = document.getElementById(`${GameState.currentMode}-ui`);
    if (modeUI) modeUI.style.display = 'flex';
    
    // Start mode-specific round
    if (GameState.currentMode === 'prompt-battle') {
        PromptBattle.startPromptBattle();
        startTimer(handleTimeUp);
        PromptBattle.checkAllSubmitted(() => startJudgingPhase());
    } else if (GameState.currentMode === 'story-builder') {
        StoryBuilder.startStoryBuilder();
        startTimer(handleTimeUp);
        StoryBuilder.checkAllSubmitted(() => startJudgingPhase());
    } else if (GameState.currentMode === 'ai-trivia') {
        Trivia.startTrivia();
        startTimer(handleTimeUp);
        Trivia.checkAllSubmitted(handleTriviaComplete);
    }
    
    if (SoundFX) SoundFX.play('roundStart');
}

/**
 * Handle time running out
 */
function handleTimeUp() {
    // Auto-submit if not submitted
    if (!GameState.answers[GameState.playerId]) {
        if (GameState.currentMode === 'prompt-battle') {
            const answer = document.getElementById('player-answer').value.trim() || "(No answer - too slow!)";
            PromptBattle.submitAnswerInternal(answer);
        } else if (GameState.currentMode === 'story-builder') {
            const part = document.getElementById('story-input').value.trim() || "(Someone zoned out here)";
            StoryBuilder.submitStoryPartInternal(part);
        }
    }
    
    // Move to judging phase after short delay
    setTimeout(() => {
        if (GameState.currentMode === 'ai-trivia') {
            Trivia.showTriviaResults(handleTriviaComplete);
        } else {
            startJudgingPhase();
        }
    }, 1500);
}

/**
 * Start the judging phase
 */
function startJudgingPhase() {
    if (GameState.currentMode === 'prompt-battle') {
        PromptBattle.startJudging(handleRoundComplete);
    } else if (GameState.currentMode === 'story-builder') {
        StoryBuilder.startJudging(handleRoundComplete);
    }
}

/**
 * Handle round completion
 * @param {string} winnerId - ID of the round winner
 */
function handleRoundComplete(winnerId) {
    displayRoundResults(winnerId, nextRound);
    
    if (!GameState.isHost) {
        pollForNextRound(
            () => {
                showScreen('game-screen');
                startRound();
            },
            showFinalResults
        );
    }
}

/**
 * Handle trivia round completion
 */
function handleTriviaComplete() {
    Trivia.advanceQuestion();
    nextRound();
}

/**
 * Advance to the next round
 */
window.nextRound = function() {
    GameState.currentRound++;
    
    if (GameState.currentRound > GameState.settings.rounds) {
        GameState.gamePhase = 'finished';
        saveGameState();
        showFinalResults();
    } else {
        GameState.answers = {};
        GameState.votes = {};
        saveGameState();
        
        document.getElementById('current-round').textContent = GameState.currentRound;
        showScreen('game-screen');
        startRound();
    }
};

// Alias for internal use
const nextRound = window.nextRound;

// ========================================
// FINAL RESULTS
// ========================================

/**
 * Show final game results
 */
function showFinalResults() {
    if (GameState.currentMode === 'story-builder') {
        displayStoryResults();
    } else {
        displayFinalResults();
    }
}

// ========================================
// PLAY AGAIN / NEW GAME
// ========================================

window.playAgain = function() {
    GameState.currentRound = 1;
    GameState.gamePhase = 'lobby';
    GameState.answers = {};
    GameState.votes = {};
    GameState.story = [];
    GameState.triviaQuestions = [];
    GameState.currentQuestionIndex = 0;
    
    initializeScores();
    
    saveGameState();
    updateLobbyUI();
    showScreen('lobby-screen');
    startLobbyPolling(startGameForPlayer);
};

window.newGame = function() {
    clearGameState();
    resetGameState();
    showScreen('welcome-screen');
};

// ========================================
// ANSWER SUBMISSION (exposed to window)
// ========================================

window.submitAnswer = PromptBattle.submitAnswer;
window.submitStoryPart = StoryBuilder.submitStoryPart;

// ========================================
// VOICE INPUT
// ========================================

window.toggleVoiceInput = function() {
    if (GameState.currentMode === 'story-builder') {
        toggleVoiceInput('story-input', 'story-char-count');
    } else {
        toggleVoiceInput('player-answer', 'char-count');
    }
};

// ========================================
// SOUND TOGGLE
// ========================================

window.toggleSound = function() {
    if (!SoundFX) return;
    
    const enabled = SoundFX.toggle();
    const btn = document.getElementById('sound-toggle');
    btn.textContent = enabled ? '🔊' : '🔇';
    btn.classList.toggle('muted', !enabled);
    showToast(enabled ? 'Sound ON! 🔊' : 'Sound OFF 🔇', 'info');
};

// ========================================
// DEMO MODE
// ========================================

window.startDemoMode = function() {
    mpStartDemoMode(() => {
        startLobbyPolling(startGameForPlayer);
    });
};

// ========================================
// SCREEN NAVIGATION (exposed to window)
// ========================================

window.showScreen = showScreen;

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎉 AI Party Game loaded!');
    
    // Initialize sound system
    initSoundFX();
    if (SoundFX) SoundFX.init();
    
    // Check for existing game in URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    
    if (roomFromUrl) {
        document.getElementById('room-code').value = roomFromUrl;
        showScreen('join-game');
    }
});

// Handle visibility change for polling
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && GameState.gamePhase === 'lobby') {
        loadGameState();
        updateLobbyUI();
    }
});
