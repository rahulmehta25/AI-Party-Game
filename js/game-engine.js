/**
 * AI Party Game - Game Engine
 * Core game state, scoring, rounds, and AI backend
 */

// ========================================
// AI BACKEND CONFIGURATION
// ========================================

export const AI_CONFIG = {
    serverUrl: 'http://localhost:3001',
    useRealAI: true,
    timeout: 15000
};

/**
 * Call the AI backend with given endpoint and data
 * @param {string} endpoint - API endpoint to call
 * @param {Object} data - Request payload
 * @returns {Promise<Object|null>} Response data or null on failure
 */
export async function callAI(endpoint, data) {
    if (!AI_CONFIG.useRealAI) {
        return null;
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeout);
        
        const response = await fetch(`${AI_CONFIG.serverUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`AI server error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.warn('AI backend unavailable, using fallback:', error.message);
        return null;
    }
}

// ========================================
// GAME STATE
// ========================================

export const GameState = {
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
    gamePhase: 'lobby',
    currentPrompt: null,
    answers: {},
    votes: {},
    story: [],
    triviaQuestions: [],
    currentQuestionIndex: 0
};

/**
 * Reset game state to initial values
 */
export function resetGameState() {
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
        story: [],
        triviaQuestions: [],
        currentQuestionIndex: 0
    });
}

// ========================================
// GAME DATA
// ========================================

export const AVATARS = ['🦊', '🐸', '🦁', '🐼', '🐨', '🦄', '🐙', '🦋', '🐲', '🦖', '🐺', '🦝', '🦩', '🦜', '🐢', '🦀'];

export const PROMPTS = {
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

export const STORY_STARTERS = [
    "Once upon a time, in a world where WiFi was a myth...",
    "It was a dark and stormy night when the pizza arrived...",
    "Nobody expected the cat to lead the rebellion, but here we were...",
    "The prophecy spoke of one who would finally understand IKEA instructions...",
    "In the year 3000, humans had evolved to be 90% meme...",
    "Legend says the last parking spot at Costco was cursed...",
    "The royal family had a secret: they were actually really into karaoke...",
    "Deep in the jungle, a civilization of extremely polite monkeys flourished..."
];

export const TRIVIA_CATEGORIES = ['Science Fiction', 'Pop Culture', 'Weird History', 'Food Facts', 'Technology', 'Nature', 'Space', 'Random'];

export const AI_JUDGMENTS = {
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

// Demo mode AI answers
export const AI_DEMO_ANSWERS = [
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

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get a random item from an array
 * @param {Array} array - Array to pick from
 * @returns {*} Random item
 */
export function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array (Fisher-Yates)
 * @param {Array} array - Array to shuffle
 * @returns {Array} New shuffled array
 */
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Generate a unique player ID
 * @returns {string} Player ID
 */
export function generatePlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9);
}

// ========================================
// SCORING
// ========================================

/**
 * Award points to a player
 * @param {string} playerId - Player to award points to
 * @param {number} points - Points to award
 */
export function awardPoints(playerId, points) {
    GameState.scores[playerId] = (GameState.scores[playerId] || 0) + points;
}

/**
 * Get sorted players by score (descending)
 * @returns {Array} Sorted players
 */
export function getSortedPlayersByScore() {
    return [...GameState.players].sort((a, b) => 
        (GameState.scores[b.id] || 0) - (GameState.scores[a.id] || 0)
    );
}

/**
 * Initialize scores for all players
 */
export function initializeScores() {
    GameState.players.forEach(player => {
        GameState.scores[player.id] = 0;
    });
}
