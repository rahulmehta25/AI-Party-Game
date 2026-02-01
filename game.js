/* ========================================
   AI PARTY GAME - GAME ENGINE
   The heart of the party! 🎉
   ======================================== */

// ========================================
// GAME STATE
// ========================================

const GameState = {
    roomCode: null,
    isHost: false,
    playerId: null,
    players: [],
    currentMode: 'prompt-battle',
    settings: {
        rounds: 5,
        timeLimit: 60
    },
    currentRound: 1,
    scores: {},
    gamePhase: 'lobby', // lobby, playing, judging, results
    currentPrompt: null,
    answers: {},
    votes: {},
    story: [],
    triviaQuestions: [],
    currentQuestionIndex: 0
};

// Player avatars pool
const AVATARS = ['🦊', '🐸', '🦁', '🐼', '🐨', '🦄', '🐙', '🦋', '🐲', '🦖', '🐺', '🦝', '🦩', '🦜', '🐢', '🦀'];

// ========================================
// AI PROMPTS DATABASE
// ========================================

const PROMPTS = {
    'prompt-battle': [
        "Describe your last dream, but make it sound like a movie trailer",
        "What would a dog's resume look like?",
        "Explain quantum physics like you're a disappointed parent",
        "Write a Yelp review for the Garden of Eden",
        "What's the worst advice you could give to a time traveler?",
        "Describe your morning routine as an epic fantasy quest",
        "What would aliens think if they only saw our TikToks?",
        "Write a breakup text from a sock to its missing pair",
        "Pitch a terrible superhero to Marvel executives",
        "Explain why you're late using only emojis and vibes",
        "What's in the terms and conditions nobody reads?",
        "Describe pizza to someone who's never had food",
        "Write a motivational speech for a houseplant",
        "What does WiFi dream about at night?",
        "Explain your job to a medieval peasant",
        "What would your pet say in a job interview?",
        "Describe Monday as a movie villain",
        "Write a complaint letter from furniture",
        "What's the real reason dinosaurs went extinct?",
        "Explain social media to Shakespeare",
        "What do clouds gossip about?",
        "Describe adulting to your 10-year-old self",
        "Write a haiku about procrastination",
        "What's the inside of a black hole actually like?",
        "Pitch a reality TV show nobody asked for",
        "Describe your phone's battery anxiety",
        "What would furniture say if it could talk?",
        "Write a LinkedIn post for a pirate",
        "Explain cryptocurrency to a grandma",
        "What's really happening in the Bermuda Triangle?",
        "Describe your signature dish (that you've never made)",
        "Write a complaint from your future self",
        "What do vegetables discuss in the fridge?",
        "Explain TikTok to someone from the 1800s",
        "What's the plot of the movie based on your last Google search?"
    ],
    'story-builder': [
        "an unexpected twist involving cheese",
        "a suspicious character enters",
        "everything explodes (metaphorically)",
        "someone reveals a secret",
        "a plot hole appears literally",
        "the weather does something weird",
        "a mysterious stranger appears",
        "technology betrays everyone",
        "someone finds something unusual",
        "a dramatic pause happens",
        "the villain monologues",
        "a flashback interrupts",
        "someone makes a terrible decision",
        "an animal becomes important",
        "someone says something prophetic",
        "a chase scene begins",
        "plot armor activates",
        "someone breaks the fourth wall",
        "a cliffhanger approaches",
        "the power of friendship is tested"
    ]
};

// Story starters
const STORY_STARTERS = [
    "Once upon a time, in a world where WiFi was a myth...",
    "It was a dark and stormy night when the pizza arrived...",
    "Nobody expected the cat to lead the rebellion, but here we were...",
    "The prophecy spoke of one who would finally understand IKEA instructions...",
    "In the year 3000, humans had evolved to be 90% meme...",
    "Legend says the last parking spot at Costco was cursed...",
    "The royal family had a secret: they were actually really into karaoke...",
    "Deep in the jungle, a civilization of extremely polite monkeys flourished..."
];

// Trivia categories and questions
const TRIVIA_CATEGORIES = ['Science Fiction', 'Pop Culture', 'Weird History', 'Food Facts', 'Technology', 'Nature', 'Space', 'Random'];

// AI Judgments - funny responses
const AI_JUDGMENTS = {
    good: [
        "This is disturbingly creative. I'm both impressed and concerned.",
        "My circuits are tingling with appreciation. Well done, human!",
        "This answer made me question my own existence in the best way.",
        "Peak human creativity achieved. Everyone else can go home now.",
        "I've analyzed 17 billion responses and this is in the top... well, it's up there!",
        "Even my cold, digital heart was warmed by this masterpiece.",
        "This is the kind of chaos I was programmed to appreciate."
    ],
    medium: [
        "Hmm, it's like a participation trophy came to life. But a cool one!",
        "Not bad for a being with only one brain. Keep trying!",
        "This answer is the human equivalent of a software update: necessary but not exciting.",
        "It's giving 'I tried' and honestly? That's beautiful.",
        "Average in the most spectacular way possible!"
    ],
    bad: [
        "I've seen better answers from a random word generator. And I AM one.",
        "This answer is proof that not all thoughts should leave the brain.",
        "Did you fall asleep on the keyboard? Because that would explain a lot.",
        "My expectations were low, but somehow you limbo'd under them.",
        "This is the answer equivalent of microwaved water. Technically valid, but why?"
    ],
    winner: [
        "THE COUNCIL OF AI HAS SPOKEN! This is the chosen one!",
        "In a world of answers, this one is THE answer. Crown them!",
        "My algorithms are doing a standing ovation. That's not even possible, but here we are.",
        "This response has unlocked: LEGENDARY STATUS. Achievement earned!",
        "I showed this to the other AIs and we all agreed: magnificent chaos."
    ]
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function generatePlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9);
}

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    SoundFX.play('notification');
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ========================================
// SCREEN NAVIGATION
// ========================================

function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        SoundFX.play('transition');
    }
}

// ========================================
// GAME MODE SELECTION
// ========================================

let selectedMode = 'prompt-battle';

function selectMode(mode) {
    selectedMode = mode;
    GameState.currentMode = mode;
    
    // Update UI
    document.querySelectorAll('.mode-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
    SoundFX.play('click');
}

function adjustRounds(delta) {
    const countEl = document.getElementById('round-count');
    let count = parseInt(countEl.textContent);
    count = Math.max(1, Math.min(10, count + delta));
    countEl.textContent = count;
    GameState.settings.rounds = count;
    SoundFX.play('click');
}

// ========================================
// GAME CREATION & JOINING
// ========================================

function createGame() {
    const hostName = document.getElementById('host-name').value.trim();
    
    if (!hostName) {
        showToast('Please enter your name!', 'error');
        return;
    }
    
    // Setup game state
    GameState.roomCode = generateRoomCode();
    GameState.isHost = true;
    GameState.playerId = generatePlayerId();
    GameState.settings.timeLimit = parseInt(document.getElementById('time-limit').value);
    GameState.settings.rounds = parseInt(document.getElementById('round-count').textContent);
    
    // Create host player
    const hostPlayer = {
        id: GameState.playerId,
        name: hostName,
        avatar: getRandomItem(AVATARS),
        score: 0,
        isHost: true
    };
    
    GameState.players = [hostPlayer];
    GameState.scores[GameState.playerId] = 0;
    
    // Save to localStorage (for shared screen play)
    saveGameState();
    
    // Update lobby UI
    updateLobbyUI();
    showScreen('lobby-screen');
    
    SoundFX.play('gameStart');
    showToast('Party created! Share the code!', 'success');
}

function joinGame() {
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
    
    // Load game state from localStorage
    const savedState = localStorage.getItem(`party_game_${roomCode}`);
    
    if (!savedState) {
        showToast('Room not found! Check the code.', 'error');
        return;
    }
    
    // Parse and merge state
    const loadedState = JSON.parse(savedState);
    Object.assign(GameState, loadedState);
    
    // Create new player
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
    
    SoundFX.play('playerJoin');
    showToast(`Welcome to the party, ${playerName}!`, 'success');
}

function saveGameState() {
    localStorage.setItem(`party_game_${GameState.roomCode}`, JSON.stringify(GameState));
}

function loadGameState() {
    const saved = localStorage.getItem(`party_game_${GameState.roomCode}`);
    if (saved) {
        Object.assign(GameState, JSON.parse(saved));
    }
}

// ========================================
// LOBBY MANAGEMENT
// ========================================

function updateLobbyUI() {
    // Room code
    document.getElementById('display-room-code').textContent = GameState.roomCode;
    
    // Mode badge
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
    
    // Players
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
    
    // Host controls
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

function copyRoomCode() {
    navigator.clipboard.writeText(GameState.roomCode).then(() => {
        showToast('Room code copied!', 'success');
    });
}

// Poll for new players (simple localStorage sync)
let lobbyPollInterval = null;

function startLobbyPolling() {
    lobbyPollInterval = setInterval(() => {
        loadGameState();
        updateLobbyUI();
        
        // Check if game started
        if (GameState.gamePhase === 'playing') {
            clearInterval(lobbyPollInterval);
            startGameForPlayer();
        }
    }, 1000);
}

// ========================================
// GAME START
// ========================================

function startGame() {
    if (GameState.players.length < 2) {
        showToast('Need at least 2 players!', 'error');
        return;
    }
    
    GameState.gamePhase = 'playing';
    GameState.currentRound = 1;
    GameState.answers = {};
    GameState.votes = {};
    
    // Initialize scores
    GameState.players.forEach(player => {
        GameState.scores[player.id] = 0;
    });
    
    // Initialize mode-specific data
    if (GameState.currentMode === 'story-builder') {
        GameState.story = [getRandomItem(STORY_STARTERS)];
    } else if (GameState.currentMode === 'ai-trivia') {
        generateTriviaQuestions();
    }
    
    saveGameState();
    startGameForPlayer();
}

function startGameForPlayer() {
    showScreen('game-screen');
    clearInterval(lobbyPollInterval);
    
    // Show correct mode UI
    document.getElementById('prompt-battle-ui').style.display = 'none';
    document.getElementById('story-builder-ui').style.display = 'none';
    document.getElementById('ai-trivia-ui').style.display = 'none';
    
    document.getElementById(`${GameState.currentMode.replace('-', '-')}-ui`).style.display = 'flex';
    
    // Update header
    document.getElementById('current-round').textContent = GameState.currentRound;
    document.getElementById('total-rounds').textContent = GameState.settings.rounds;
    document.getElementById('current-score').textContent = GameState.scores[GameState.playerId] || 0;
    
    startRound();
}

// ========================================
// ROUND MANAGEMENT
// ========================================

let timerInterval = null;
let timeRemaining = 60;

function startRound() {
    GameState.answers = {};
    GameState.votes = {};
    saveGameState();
    
    // Hide waiting UI
    document.getElementById('waiting-ui').style.display = 'none';
    
    // Show game mode UI
    const modeUI = document.getElementById(`${GameState.currentMode.replace('-', '-')}-ui`);
    if (modeUI) modeUI.style.display = 'flex';
    
    if (GameState.currentMode === 'prompt-battle') {
        startPromptBattle();
    } else if (GameState.currentMode === 'story-builder') {
        startStoryBuilder();
    } else if (GameState.currentMode === 'ai-trivia') {
        startTrivia();
    }
    
    startTimer();
    SoundFX.play('roundStart');
}

function startTimer() {
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
        
        // Update progress ring
        const progress = (1 - timeRemaining / GameState.settings.timeLimit) * circumference;
        progressEl.style.strokeDashoffset = progress;
        
        // Warning states
        if (timeRemaining <= 10) {
            timerEl.className = 'timer danger';
            if (timeRemaining === 10) SoundFX.play('warning');
        } else if (timeRemaining <= 20) {
            timerEl.className = 'timer warning';
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timeUp();
        }
    }, 1000);
}

function timeUp() {
    SoundFX.play('timeUp');
    
    // Auto-submit if not submitted
    if (!GameState.answers[GameState.playerId]) {
        if (GameState.currentMode === 'prompt-battle') {
            const answer = document.getElementById('player-answer').value.trim() || "(No answer - too slow!)";
            submitAnswerInternal(answer);
        } else if (GameState.currentMode === 'story-builder') {
            const part = document.getElementById('story-input').value.trim() || "(Someone zoned out here)";
            submitStoryPartInternal(part);
        }
    }
    
    // Move to judging phase after short delay
    setTimeout(() => {
        if (GameState.currentMode === 'ai-trivia') {
            showTriviaResults();
        } else {
            startJudging();
        }
    }, 1500);
}

// ========================================
// PROMPT BATTLE MODE
// ========================================

function startPromptBattle() {
    // Get a random prompt
    const prompts = PROMPTS['prompt-battle'];
    GameState.currentPrompt = getRandomItem(prompts);
    
    document.getElementById('current-prompt').textContent = GameState.currentPrompt;
    document.getElementById('player-answer').value = '';
    document.getElementById('char-count').textContent = '0';
    
    saveGameState();
}

function submitAnswer() {
    const answer = document.getElementById('player-answer').value.trim();
    
    if (!answer) {
        showToast('Write something first!', 'error');
        return;
    }
    
    submitAnswerInternal(answer);
}

function submitAnswerInternal(answer) {
    GameState.answers[GameState.playerId] = {
        text: answer,
        playerId: GameState.playerId,
        playerName: GameState.players.find(p => p.id === GameState.playerId)?.name || 'Unknown'
    };
    
    saveGameState();
    showWaitingUI();
    checkAllSubmitted();
}

// Character count for answer
document.getElementById('player-answer')?.addEventListener('input', function() {
    document.getElementById('char-count').textContent = this.value.length;
});

// ========================================
// STORY BUILDER MODE
// ========================================

function startStoryBuilder() {
    // Show current story
    document.getElementById('story-text').textContent = GameState.story.join(' ');
    
    // Get story prompt
    const promptText = getRandomItem(PROMPTS['story-builder']);
    document.getElementById('story-prompt-text').textContent = promptText;
    
    document.getElementById('story-input').value = '';
    document.getElementById('story-char-count').textContent = '0';
    
    saveGameState();
}

function submitStoryPart() {
    const part = document.getElementById('story-input').value.trim();
    
    if (!part) {
        showToast('Add something to the story!', 'error');
        return;
    }
    
    submitStoryPartInternal(part);
}

function submitStoryPartInternal(part) {
    GameState.answers[GameState.playerId] = {
        text: part,
        playerId: GameState.playerId,
        playerName: GameState.players.find(p => p.id === GameState.playerId)?.name || 'Unknown'
    };
    
    saveGameState();
    showWaitingUI();
    checkAllSubmitted();
}

document.getElementById('story-input')?.addEventListener('input', function() {
    document.getElementById('story-char-count').textContent = this.value.length;
});

// ========================================
// TRIVIA MODE
// ========================================

function generateTriviaQuestions() {
    // Generate fun trivia questions
    const questions = [
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
    
    GameState.triviaQuestions = shuffleArray(questions).slice(0, GameState.settings.rounds);
    GameState.currentQuestionIndex = 0;
}

function startTrivia() {
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

function selectTriviaAnswer(index) {
    // Remove previous selection
    document.querySelectorAll('.trivia-option').forEach(opt => opt.classList.remove('selected'));
    
    // Select this one
    document.querySelectorAll('.trivia-option')[index].classList.add('selected');
    
    GameState.answers[GameState.playerId] = {
        answer: index,
        playerId: GameState.playerId
    };
    
    SoundFX.play('click');
    saveGameState();
    
    // Auto-advance after selection (brief delay for feedback)
    setTimeout(() => {
        showWaitingUI();
        checkAllSubmitted();
    }, 500);
}

function showTriviaResults() {
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
        GameState.scores[GameState.playerId] = (GameState.scores[GameState.playerId] || 0) + 100;
        showToast('Correct! +100 points! 🎉', 'success');
        SoundFX.play('correct');
    } else {
        showToast(`Wrong! It was: ${question.options[question.correct]}`, 'error');
        SoundFX.play('wrong');
    }
    
    saveGameState();
    
    setTimeout(() => {
        advanceRound();
    }, 2500);
}

// ========================================
// WAITING & JUDGING
// ========================================

function showWaitingUI() {
    // Hide game UI
    document.querySelectorAll('.game-mode-ui').forEach(ui => ui.style.display = 'none');
    
    // Show waiting UI
    document.getElementById('waiting-ui').style.display = 'flex';
    
    // Show who has submitted
    updateSubmittedList();
}

function updateSubmittedList() {
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

function checkAllSubmitted() {
    loadGameState();
    updateSubmittedList();
    
    const allSubmitted = GameState.players.every(p => GameState.answers[p.id]);
    
    if (allSubmitted) {
        clearInterval(timerInterval);
        
        if (GameState.currentMode === 'ai-trivia') {
            showTriviaResults();
        } else {
            setTimeout(() => startJudging(), 1000);
        }
    } else {
        // Poll for other players
        setTimeout(checkAllSubmitted, 1000);
    }
}

function startJudging() {
    showScreen('judging-screen');
    
    // Show the prompt
    document.getElementById('judging-prompt').textContent = GameState.currentPrompt;
    
    // Display all answers
    const answersContainer = document.getElementById('answers-to-judge');
    answersContainer.innerHTML = '';
    
    const answers = Object.values(GameState.answers);
    const shuffledAnswers = shuffleArray(answers);
    
    shuffledAnswers.forEach((answer, index) => {
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
        
        // Can't vote for yourself
        if (answer.playerId !== GameState.playerId) {
            card.onclick = () => voteForAnswer(answer.playerId);
        } else {
            card.classList.remove('votable');
            card.style.opacity = '0.6';
        }
        
        answersContainer.appendChild(card);
    });
    
    // Show AI judging or player voting
    if (GameState.players.length <= 2) {
        // AI judges for 2 players
        document.getElementById('ai-judging').style.display = 'flex';
        document.getElementById('player-voting').style.display = 'none';
        
        // AI thinking animation
        setTimeout(() => {
            performAIJudging();
        }, 2000);
    } else {
        // Player voting for 3+ players
        document.getElementById('ai-judging').style.display = 'none';
        document.getElementById('player-voting').style.display = 'block';
    }
}

function voteForAnswer(playerId) {
    if (playerId === GameState.playerId) return;
    if (GameState.votes[GameState.playerId]) return;
    
    GameState.votes[GameState.playerId] = playerId;
    saveGameState();
    
    // Update UI
    document.querySelectorAll('.answer-card').forEach(card => {
        if (card.dataset.playerId === playerId) {
            card.classList.add('voted');
        }
    });
    
    SoundFX.play('vote');
    showToast('Vote cast! 🗳️', 'success');
    
    // Check if all voted
    checkAllVoted();
}

function checkAllVoted() {
    loadGameState();
    
    const votingPlayers = GameState.players.filter(p => GameState.answers[p.id]);
    const allVoted = votingPlayers.every(p => GameState.votes[p.id]);
    
    if (allVoted) {
        tallyVotesAndShowResults();
    } else {
        setTimeout(checkAllVoted, 1000);
    }
}

function performAIJudging() {
    const answers = Object.values(GameState.answers);
    
    // AI "picks" a winner (randomly but with flair)
    const winner = getRandomItem(answers);
    
    // Show AI judgment
    const judgmentEl = document.getElementById('ai-judgment');
    judgmentEl.textContent = getRandomItem(AI_JUDGMENTS.winner);
    
    // Award points
    GameState.scores[winner.playerId] = (GameState.scores[winner.playerId] || 0) + 100;
    saveGameState();
    
    SoundFX.play('winner');
    
    setTimeout(() => {
        showRoundResults(winner.playerId);
    }, 3000);
}

function tallyVotesAndShowResults() {
    const voteCounts = {};
    
    Object.values(GameState.votes).forEach(votedFor => {
        voteCounts[votedFor] = (voteCounts[votedFor] || 0) + 1;
    });
    
    // Find winner
    let winnerId = null;
    let maxVotes = 0;
    
    Object.entries(voteCounts).forEach(([playerId, count]) => {
        if (count > maxVotes) {
            maxVotes = count;
            winnerId = playerId;
        }
    });
    
    if (!winnerId) {
        // Tie or no votes - pick random
        winnerId = getRandomItem(Object.keys(GameState.answers));
    }
    
    // Award points (100 base + 25 per vote)
    const points = 100 + (maxVotes * 25);
    GameState.scores[winnerId] = (GameState.scores[winnerId] || 0) + points;
    saveGameState();
    
    // Show votes on cards
    document.querySelectorAll('.answer-card').forEach(card => {
        const playerId = card.dataset.playerId;
        const votes = voteCounts[playerId] || 0;
        const votesDiv = card.querySelector('.answer-votes');
        votesDiv.style.display = 'flex';
        votesDiv.querySelector('.vote-count').textContent = votes;
    });
    
    SoundFX.play('winner');
    
    setTimeout(() => {
        showRoundResults(winnerId);
    }, 2000);
}

// ========================================
// ROUND RESULTS
// ========================================

function showRoundResults(winnerId) {
    showScreen('round-results');
    
    // Handle story mode specially
    if (GameState.currentMode === 'story-builder') {
        // Add winning story part
        const winningPart = GameState.answers[winnerId]?.text || '';
        GameState.story.push(winningPart);
        saveGameState();
    }
    
    const winner = GameState.players.find(p => p.id === winnerId);
    const winningAnswer = GameState.answers[winnerId];
    
    // Update winner card
    document.getElementById('round-winner').textContent = winner?.name || 'Unknown';
    document.getElementById('winning-answer').textContent = `"${winningAnswer?.text || '...'}"`;
    document.getElementById('points-earned').textContent = '100';
    
    // AI commentary
    const commentary = getRandomItem([...AI_JUDGMENTS.good, ...AI_JUDGMENTS.winner]);
    document.getElementById('ai-comment').textContent = commentary;
    
    // Update standings
    const standingsList = document.getElementById('standings-list');
    standingsList.innerHTML = '';
    
    const sortedPlayers = [...GameState.players].sort((a, b) => 
        (GameState.scores[b.id] || 0) - (GameState.scores[a.id] || 0)
    );
    
    sortedPlayers.forEach((player, index) => {
        const row = document.createElement('div');
        row.className = 'standing-row';
        row.innerHTML = `
            <span class="standing-rank">${index + 1}</span>
            <span class="standing-name">${player.avatar} ${player.name}</span>
            <span class="standing-score">${GameState.scores[player.id] || 0}</span>
        `;
        standingsList.appendChild(row);
    });
    
    // Update header score
    document.getElementById('current-score').textContent = GameState.scores[GameState.playerId] || 0;
    
    // Only host can advance
    const nextBtn = document.getElementById('next-round-btn');
    if (GameState.isHost) {
        nextBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'none';
        // Poll for next round
        pollForNextRound();
    }
}

function pollForNextRound() {
    const pollInterval = setInterval(() => {
        loadGameState();
        
        if (GameState.gamePhase === 'playing' && Object.keys(GameState.answers).length === 0) {
            clearInterval(pollInterval);
            showScreen('game-screen');
            startRound();
        } else if (GameState.gamePhase === 'finished') {
            clearInterval(pollInterval);
            showFinalResults();
        }
    }, 1000);
}

function nextRound() {
    GameState.currentRound++;
    
    if (GameState.currentRound > GameState.settings.rounds) {
        // Game over!
        GameState.gamePhase = 'finished';
        saveGameState();
        showFinalResults();
    } else {
        // Next round
        GameState.answers = {};
        GameState.votes = {};
        
        if (GameState.currentMode === 'ai-trivia') {
            GameState.currentQuestionIndex++;
        }
        
        saveGameState();
        
        document.getElementById('current-round').textContent = GameState.currentRound;
        showScreen('game-screen');
        startRound();
    }
}

function advanceRound() {
    // For trivia mode (auto-advance)
    nextRound();
}

// ========================================
// FINAL RESULTS
// ========================================

function showFinalResults() {
    // For story mode, show story results instead
    if (GameState.currentMode === 'story-builder') {
        showStoryResults();
        return;
    }
    
    showScreen('final-results');
    SoundFX.play('gameEnd');
    
    // Sort players by score
    const sortedPlayers = [...GameState.players].sort((a, b) => 
        (GameState.scores[b.id] || 0) - (GameState.scores[a.id] || 0)
    );
    
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
    
    // Full scores list
    const scoresList = document.getElementById('final-scores-list');
    scoresList.innerHTML = '';
    
    sortedPlayers.forEach((player, index) => {
        const row = document.createElement('div');
        row.className = 'standing-row';
        row.innerHTML = `
            <span class="standing-rank">${index + 1}</span>
            <span class="standing-name">${player.avatar} ${player.name}</span>
            <span class="standing-score">${GameState.scores[player.id] || 0}</span>
        `;
        scoresList.appendChild(row);
    });
    
    // Stats
    document.getElementById('stat-rounds').textContent = GameState.settings.rounds;
    document.getElementById('stat-answers').textContent = GameState.players.length * GameState.settings.rounds;
}

function showStoryResults() {
    showScreen('story-results');
    SoundFX.play('gameEnd');
    
    // Show complete story
    document.getElementById('complete-story').textContent = GameState.story.join(' ');
    
    // Contributors
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
// PLAY AGAIN / NEW GAME
// ========================================

function playAgain() {
    // Reset scores but keep players
    GameState.currentRound = 1;
    GameState.gamePhase = 'lobby';
    GameState.answers = {};
    GameState.votes = {};
    GameState.story = [];
    
    GameState.players.forEach(player => {
        GameState.scores[player.id] = 0;
    });
    
    saveGameState();
    updateLobbyUI();
    showScreen('lobby-screen');
    startLobbyPolling();
}

function newGame() {
    // Clear game state
    localStorage.removeItem(`party_game_${GameState.roomCode}`);
    
    // Reset everything
    Object.assign(GameState, {
        roomCode: null,
        isHost: false,
        playerId: null,
        players: [],
        currentMode: 'prompt-battle',
        currentRound: 1,
        scores: {},
        gamePhase: 'lobby',
        answers: {},
        votes: {},
        story: []
    });
    
    showScreen('welcome-screen');
}

// ========================================
// VOICE INPUT
// ========================================

let recognition = null;
let isRecording = false;

function toggleVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showToast('Voice input not supported in this browser', 'error');
        return;
    }
    
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    
    const targetInput = GameState.currentMode === 'story-builder' 
        ? document.getElementById('story-input')
        : document.getElementById('player-answer');
    
    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        targetInput.value = transcript;
        
        // Update char count
        const countId = GameState.currentMode === 'story-builder' ? 'story-char-count' : 'char-count';
        document.getElementById(countId).textContent = transcript.length;
    };
    
    recognition.onend = () => {
        stopRecording();
    };
    
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
    
    SoundFX.play('click');
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

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎉 AI Party Game loaded!');
    
    // Check for existing game in URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    
    if (roomFromUrl) {
        document.getElementById('room-code').value = roomFromUrl;
        showScreen('join-game');
    }
    
    // Initialize sounds
    SoundFX.init();
});

// Handle visibility change for polling
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && GameState.gamePhase === 'lobby') {
        loadGameState();
        updateLobbyUI();
    }
});

// ========================================
// SOUND TOGGLE
// ========================================

function toggleSound() {
    const enabled = SoundFX.toggle();
    const btn = document.getElementById('sound-toggle');
    btn.textContent = enabled ? '🔊' : '🔇';
    btn.classList.toggle('muted', !enabled);
    showToast(enabled ? 'Sound ON! 🔊' : 'Sound OFF 🔇', 'info');
}

// ========================================
// DEMO MODE (for testing)
// ========================================

function startDemoMode() {
    // Create a fake game with AI players
    GameState.roomCode = 'DEMO';
    GameState.isHost = true;
    GameState.playerId = generatePlayerId();
    GameState.currentMode = 'prompt-battle';
    GameState.settings = { rounds: 3, timeLimit: 30 };
    
    // Add demo players
    const demoNames = ['You', 'PartyBot 🤖', 'LaughMaster', 'JokeStar'];
    GameState.players = demoNames.map((name, i) => ({
        id: i === 0 ? GameState.playerId : `demo_${i}`,
        name: name,
        avatar: AVATARS[i],
        score: 0,
        isHost: i === 0
    }));
    
    // Initialize scores
    GameState.players.forEach(p => GameState.scores[p.id] = 0);
    
    saveGameState();
    showToast('🎭 Demo Mode Started!', 'success');
    
    // Go straight to lobby
    updateLobbyUI();
    showScreen('lobby-screen');
}

// ========================================
// SIMULATE AI PLAYERS (for demo mode)
// ========================================

const AI_DEMO_ANSWERS = [
    "I'm a robot and even I found that confusing!",
    "According to my calculations, chaos is the only answer.",
    "Error 404: Serious response not found.",
    "My circuits are tingling with excitement!",
    "*beep boop* That's my final answer!",
    "As an AI, I'm legally required to make this weird.",
    "Processing... processing... yeah, I got nothing better.",
    "This answer was generated by 100% renewable confusion.",
    "My programmer did NOT prepare me for this.",
    "Insert witty response here [TODO]"
];

function simulateAIPlayers() {
    if (GameState.roomCode !== 'DEMO') return;
    
    // AI players submit random answers after a delay
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

// Override check for demo mode
const originalCheckAllSubmitted = checkAllSubmitted;
checkAllSubmitted = function() {
    if (GameState.roomCode === 'DEMO') {
        simulateAIPlayers();
    }
    
    loadGameState();
    updateSubmittedList();
    
    const allSubmitted = GameState.players.every(p => GameState.answers[p.id]);
    
    if (allSubmitted) {
        clearInterval(timerInterval);
        
        if (GameState.currentMode === 'ai-trivia') {
            showTriviaResults();
        } else {
            setTimeout(() => startJudging(), 1000);
        }
    } else {
        setTimeout(checkAllSubmitted, 1000);
    }
};

// Auto-vote in demo mode
const originalCheckAllVoted = checkAllVoted;
checkAllVoted = function() {
    if (GameState.roomCode === 'DEMO') {
        // AI players vote randomly
        GameState.players.forEach(player => {
            if (player.id !== GameState.playerId && !GameState.votes[player.id]) {
                const otherPlayers = GameState.players.filter(p => p.id !== player.id);
                const votedFor = getRandomItem(otherPlayers);
                GameState.votes[player.id] = votedFor.id;
            }
        });
        saveGameState();
    }
    
    loadGameState();
    
    const votingPlayers = GameState.players.filter(p => GameState.answers[p.id]);
    const allVoted = votingPlayers.every(p => GameState.votes[p.id]);
    
    if (allVoted) {
        tallyVotesAndShowResults();
    } else {
        setTimeout(checkAllVoted, 1000);
    }
};
