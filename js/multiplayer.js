/**
 * AI Party Game - Multiplayer Module
 * Room codes, player management, lobby, localStorage sync
 */

import { GameState, AVATARS, generatePlayerId, getRandomItem } from './game-engine.js';
import { showToast, showScreen } from './ui.js';

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
// ROOM CODE GENERATION
// ========================================

/**
 * Generate a random 4-character room code
 * @returns {string} Room code
 */
export function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Copy room code to clipboard
 */
export function copyRoomCode() {
    navigator.clipboard.writeText(GameState.roomCode).then(() => {
        showToast('Room code copied!', 'success');
    });
}

// ========================================
// GAME STATE PERSISTENCE
// ========================================

/**
 * Save current game state to localStorage
 */
export function saveGameState() {
    localStorage.setItem(`party_game_${GameState.roomCode}`, JSON.stringify(GameState));
}

/**
 * Load game state from localStorage
 */
export function loadGameState() {
    const saved = localStorage.getItem(`party_game_${GameState.roomCode}`);
    if (saved) {
        Object.assign(GameState, JSON.parse(saved));
    }
}

/**
 * Clear game state from localStorage
 */
export function clearGameState() {
    localStorage.removeItem(`party_game_${GameState.roomCode}`);
}

// ========================================
// LOBBY MANAGEMENT
// ========================================

let lobbyPollInterval = null;

/**
 * Update the lobby UI with current game state
 */
export function updateLobbyUI() {
    document.getElementById('display-room-code').textContent = GameState.roomCode;
    
    const modeIcons = {
        'prompt-battle': '⚔️',
        'story-builder': '📖',
        'ai-trivia': '🧠'
    };
    const modeNames = {
        'prompt-battle': 'Prompt Battle',
        'story-builder': 'Story Builder',
        'ai-trivia': 'AI Trivia'
    };
    
    document.getElementById('lobby-mode-icon').textContent = modeIcons[GameState.currentMode];
    document.getElementById('lobby-mode-name').textContent = modeNames[GameState.currentMode];
    
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';
    
    GameState.players.forEach(player => {
        const card = document.createElement('div');
        card.className = `player-card ${player.isHost ? 'host' : ''}`;
        card.innerHTML = `
            <div class="player-avatar">${player.avatar}</div>
            <div class="player-name">${player.name}</div>
        `;
        playersList.appendChild(card);
    });
    
    document.getElementById('player-count').textContent = GameState.players.length;
    
    if (GameState.isHost) {
        document.getElementById('host-controls').style.display = 'block';
        document.getElementById('player-waiting').style.display = 'none';
        
        const startBtn = document.getElementById('start-game-btn');
        startBtn.disabled = GameState.players.length < 2;
    } else {
        document.getElementById('host-controls').style.display = 'none';
        document.getElementById('player-waiting').style.display = 'block';
    }
}

/**
 * Start polling for lobby updates
 * @param {Function} onGameStart - Callback when game starts
 */
export function startLobbyPolling(onGameStart) {
    lobbyPollInterval = setInterval(() => {
        loadGameState();
        updateLobbyUI();
        
        if (GameState.gamePhase === 'playing') {
            clearInterval(lobbyPollInterval);
            onGameStart();
        }
    }, 1000);
}

/**
 * Stop lobby polling
 */
export function stopLobbyPolling() {
    if (lobbyPollInterval) {
        clearInterval(lobbyPollInterval);
        lobbyPollInterval = null;
    }
}

// ========================================
// GAME CREATION & JOINING
// ========================================

/**
 * Create a new game
 * @param {Function} onSuccess - Callback on successful creation
 */
export function createGame(onSuccess) {
    const hostName = document.getElementById('host-name').value.trim();
    
    if (!hostName) {
        showToast('Please enter your name!', 'error');
        return;
    }
    
    GameState.roomCode = generateRoomCode();
    GameState.isHost = true;
    GameState.playerId = generatePlayerId();
    GameState.settings.timeLimit = parseInt(document.getElementById('time-limit').value);
    GameState.settings.rounds = parseInt(document.getElementById('round-count').textContent);
    
    const hostPlayer = {
        id: GameState.playerId,
        name: hostName,
        avatar: getRandomItem(AVATARS),
        score: 0,
        isHost: true
    };
    
    GameState.players = [hostPlayer];
    GameState.scores[GameState.playerId] = 0;
    
    saveGameState();
    updateLobbyUI();
    showScreen('lobby-screen');
    
    if (SoundFX) SoundFX.play('gameStart');
    showToast('Party created! Share the code!', 'success');
    
    if (onSuccess) onSuccess();
}

/**
 * Join an existing game
 * @param {Function} onSuccess - Callback on successful join
 */
export function joinGame(onSuccess) {
    const playerName = document.getElementById('player-name').value.trim();
    const roomCode = document.getElementById('room-code').value.trim().toUpperCase();
    
    if (!playerName) {
        showToast('Please enter your name!', 'error');
        return;
    }
    
    if (!roomCode || roomCode.length !== 4) {
        showToast('Enter a valid room code!', 'error');
        return;
    }
    
    const savedState = localStorage.getItem(`party_game_${roomCode}`);
    
    if (!savedState) {
        showToast('Room not found! Check the code.', 'error');
        return;
    }
    
    const loadedState = JSON.parse(savedState);
    Object.assign(GameState, loadedState);
    
    GameState.playerId = generatePlayerId();
    GameState.isHost = false;
    
    const usedAvatars = GameState.players.map(p => p.avatar);
    const availableAvatars = AVATARS.filter(a => !usedAvatars.includes(a));
    
    const newPlayer = {
        id: GameState.playerId,
        name: playerName,
        avatar: getRandomItem(availableAvatars.length > 0 ? availableAvatars : AVATARS),
        score: 0,
        isHost: false
    };
    
    GameState.players.push(newPlayer);
    GameState.scores[GameState.playerId] = 0;
    
    saveGameState();
    updateLobbyUI();
    showScreen('lobby-screen');
    
    if (SoundFX) SoundFX.play('playerJoin');
    showToast(`Welcome to the party, ${playerName}!`, 'success');
    
    if (onSuccess) onSuccess();
}

// ========================================
// POLLING FOR GAME STATE CHANGES
// ========================================

let roundPollInterval = null;

/**
 * Poll for next round to start (non-host players)
 * @param {Function} onNextRound - Callback when next round starts
 * @param {Function} onGameEnd - Callback when game ends
 */
export function pollForNextRound(onNextRound, onGameEnd) {
    roundPollInterval = setInterval(() => {
        loadGameState();
        
        if (GameState.gamePhase === 'playing' && Object.keys(GameState.answers).length === 0) {
            clearInterval(roundPollInterval);
            onNextRound();
        } else if (GameState.gamePhase === 'finished') {
            clearInterval(roundPollInterval);
            onGameEnd();
        }
    }, 1000);
}

/**
 * Stop round polling
 */
export function stopRoundPolling() {
    if (roundPollInterval) {
        clearInterval(roundPollInterval);
        roundPollInterval = null;
    }
}

// ========================================
// DEMO MODE
// ========================================

/**
 * Start demo mode with AI players
 * @param {Function} onReady - Callback when demo is ready
 */
export function startDemoMode(onReady) {
    GameState.roomCode = 'DEMO';
    GameState.isHost = true;
    GameState.playerId = generatePlayerId();
    GameState.currentMode = 'prompt-battle';
    GameState.settings = { rounds: 3, timeLimit: 30 };
    
    const demoNames = ['You', 'PartyBot 🤖', 'LaughMaster', 'JokeStar'];
    GameState.players = demoNames.map((name, i) => ({
        id: i === 0 ? GameState.playerId : `demo_${i}`,
        name: name,
        avatar: AVATARS[i],
        score: 0,
        isHost: i === 0
    }));
    
    GameState.players.forEach(p => GameState.scores[p.id] = 0);
    
    saveGameState();
    showToast('🎭 Demo Mode Started!', 'success');
    
    updateLobbyUI();
    showScreen('lobby-screen');
    
    if (onReady) onReady();
}

/**
 * Check if currently in demo mode
 * @returns {boolean} True if in demo mode
 */
export function isDemoMode() {
    return GameState.roomCode === 'DEMO';
}
