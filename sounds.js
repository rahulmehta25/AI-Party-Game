/* ========================================
   AI PARTY GAME - SOUND EFFECTS
   Fun party sounds using Web Audio API! 🔊
   ======================================== */

const SoundFX = {
    audioContext: null,
    enabled: true,
    volume: 0.5,
    
    init() {
        // Create audio context on first user interaction
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });
        
        console.log('🔊 Sound system initialized');
    },
    
    play(sound) {
        if (!this.enabled || !this.audioContext) return;
        
        switch(sound) {
            case 'click':
                this.playClick();
                break;
            case 'transition':
                this.playTransition();
                break;
            case 'gameStart':
                this.playGameStart();
                break;
            case 'playerJoin':
                this.playPlayerJoin();
                break;
            case 'roundStart':
                this.playRoundStart();
                break;
            case 'warning':
                this.playWarning();
                break;
            case 'timeUp':
                this.playTimeUp();
                break;
            case 'vote':
                this.playVote();
                break;
            case 'winner':
                this.playWinner();
                break;
            case 'correct':
                this.playCorrect();
                break;
            case 'wrong':
                this.playWrong();
                break;
            case 'gameEnd':
                this.playGameEnd();
                break;
            case 'notification':
                this.playNotification();
                break;
        }
    },
    
    // Create an oscillator for basic sounds
    createOscillator(type = 'sine', frequency = 440, duration = 0.1) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        return { oscillator, gainNode };
    },
    
    // Simple click sound
    playClick() {
        const { oscillator, gainNode } = this.createOscillator('sine', 800, 0.05);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.05);
    },
    
    // Screen transition whoosh
    playTransition() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.15);
    },
    
    // Game start fanfare
    playGameStart() {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const duration = 0.15;
        
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const { oscillator } = this.createOscillator('square', freq, duration + 0.1);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + duration + 0.1);
            }, i * 100);
        });
    },
    
    // Player joined pop
    playPlayerJoin() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(this.volume * 0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    },
    
    // Round start drum
    playRoundStart() {
        // Low thump
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(this.volume * 0.6, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
        
        // High accent
        setTimeout(() => {
            const { oscillator: osc2 } = this.createOscillator('triangle', 600, 0.1);
            osc2.start();
            osc2.stop(this.audioContext.currentTime + 0.1);
        }, 100);
    },
    
    // Warning beep
    playWarning() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const { oscillator } = this.createOscillator('square', 880, 0.1);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.1);
            }, i * 150);
        }
    },
    
    // Time's up buzzer
    playTimeUp() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(this.volume * 0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
    },
    
    // Vote cast
    playVote() {
        const { oscillator } = this.createOscillator('sine', 523.25, 0.1);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
        
        setTimeout(() => {
            const { oscillator: osc2 } = this.createOscillator('sine', 659.25, 0.15);
            osc2.start();
            osc2.stop(this.audioContext.currentTime + 0.15);
        }, 100);
    },
    
    // Winner celebration
    playWinner() {
        const notes = [523.25, 659.25, 783.99, 880, 1046.50]; // Victory fanfare
        
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.3);
            }, i * 80);
        });
    },
    
    // Correct answer
    playCorrect() {
        const notes = [523.25, 783.99]; // Happy interval
        
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const { oscillator } = this.createOscillator('sine', freq, 0.2);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.2);
            }, i * 100);
        });
    },
    
    // Wrong answer
    playWrong() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(150, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    },
    
    // Game end celebration
    playGameEnd() {
        // Epic fanfare
        const sequence = [
            { freq: 392, time: 0 },     // G4
            { freq: 523.25, time: 100 }, // C5
            { freq: 659.25, time: 200 }, // E5
            { freq: 783.99, time: 300 }, // G5
            { freq: 1046.50, time: 500 }, // C6 (hold)
        ];
        
        sequence.forEach(({ freq, time }) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                
                const duration = time === 500 ? 0.5 : 0.2;
                
                gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + duration);
            }, time);
        });
    },
    
    // Toast notification
    playNotification() {
        const { oscillator } = this.createOscillator('sine', 700, 0.08);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.08);
        
        setTimeout(() => {
            const { oscillator: osc2 } = this.createOscillator('sine', 900, 0.1);
            osc2.start();
            osc2.stop(this.audioContext.currentTime + 0.1);
        }, 80);
    },
    
    // Toggle sound
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    },
    
    // Set volume (0-1)
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
};
