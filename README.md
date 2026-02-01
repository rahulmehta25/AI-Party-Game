# 🎮 AI Party Game 🎉

**Like Jackbox, but with AI-generated prompts and judging!**

A fun, colorful party game for friends and family. Play on shared screens or using room codes!

![Party Time!](https://img.shields.io/badge/Status-Ready%20to%20Party-ff6b6b?style=for-the-badge)
![Players](https://img.shields.io/badge/Players-2--8-4ecdc4?style=for-the-badge)
![No Install](https://img.shields.io/badge/Install-None%20Required-ffe66d?style=for-the-badge)

---

## 🚀 Quick Start

1. **Open the game:**
   - Open `index.html` in a browser, OR
   - Run a local server: `python3 -m http.server 8080`
   - Visit: http://localhost:8080

2. **Create a game** → Pick a mode → Share the room code

3. **Friends join** → Enter room code → Party time! 🎊

---

## 🎯 Game Modes

### ⚔️ Prompt Battle
*The classic party game mode!*
- AI gives you hilarious prompts
- Everyone writes their funniest answer
- AI judges the chaos (2 players) or vote for favorites (3+ players)
- Points for winning rounds!

**Example Prompts:**
- "Describe your last dream as a movie trailer"
- "What would a dog's resume look like?"
- "Write a Yelp review for the Garden of Eden"

### 📖 Story Builder
*Collaborative storytelling madness!*
- AI starts a story
- Each player adds a sentence
- The best addition gets added to the story
- Read the final masterpiece together!

### 🧠 AI Trivia
*Test your knowledge with unique questions!*
- AI-generated trivia questions
- Multiple choice answers
- Learn weird facts about space, history, and more!

---

## ✨ Features

- 🎨 **Colorful, party-themed UI** - Looks amazing on any screen
- 🔊 **Sound effects** - Beeps, boops, and celebration sounds
- 🎤 **Voice input** - Speak your answers (optional)
- 📱 **Mobile friendly** - Works on phones and tablets
- 🏆 **Leaderboard** - Track scores and crown the winner
- 👑 **Podium celebration** - Epic finale with 1st, 2nd, 3rd places
- 🤖 **AI judge** - Hilarious commentary on your answers
- ⏱️ **Configurable timer** - 30s to 120s per round
- 🔄 **Play again** - Quick restart with same players

---

## 🎮 How to Play

### For the Host:
1. Click **🚀 Create Game**
2. Enter your name
3. Pick a game mode (Prompt Battle is recommended!)
4. Adjust settings (rounds, time limit)
5. Click **🎉 Start The Party!**
6. Share the 4-letter room code with friends

### For Players:
1. Click **🎯 Join Game**
2. Enter your name
3. Enter the room code
4. Wait for host to start

### During the Game:
1. Read the prompt
2. Type (or speak) your answer
3. Submit before time runs out
4. Vote for your favorite answer
5. Celebrate the winner!

---

## 🛠️ Technical Details

**Built with:**
- Vanilla HTML/CSS/JavaScript
- Web Audio API for sounds
- Web Speech API for voice input
- LocalStorage for multiplayer sync

**Browser Support:**
- Chrome ✅
- Firefox ✅  
- Safari ✅
- Edge ✅
- Mobile browsers ✅

**No backend required!** Uses localStorage for shared-screen play.

---

## 📂 Project Structure

```
AI-Party-Game/
├── index.html      # Main game page
├── styles.css      # All the party vibes
├── game.js         # Game engine & logic
├── sounds.js       # Web Audio sound effects
├── README.md       # You're reading it!
└── ACTIVITY_LOG.md # Development log
```

---

## 🎨 Customization

### Add Your Own Prompts
Edit `game.js` and find the `PROMPTS` object:
```javascript
const PROMPTS = {
    'prompt-battle': [
        "Your custom prompt here!",
        // ... more prompts
    ]
};
```

### Change Colors
Edit `styles.css` and modify the CSS variables:
```css
:root {
    --primary: #ff6b6b;
    --secondary: #4ecdc4;
    --accent: #ffe66d;
    /* ... */
}
```

### Adjust Sound Volume
In the browser console:
```javascript
SoundFX.setVolume(0.3); // 0 to 1
SoundFX.toggle();       // Enable/disable
```

---

## 🐛 Troubleshooting

**Game not syncing between players?**
- Make sure all players have the same room code
- Try refreshing the page
- Check that localStorage is enabled

**Voice input not working?**
- Make sure you're using HTTPS or localhost
- Grant microphone permissions when prompted
- Not all browsers support Web Speech API

**No sound?**
- Click anywhere on the page to enable audio
- Check your device volume
- Web Audio requires user interaction to start

---

## 🎉 Credits

Made with ❤️ for party people everywhere!

**Special Thanks:**
- Jackbox Games for the inspiration
- Every AI that judged our terrible answers
- You, for playing!

---

## 📜 License

MIT License - Party responsibly! 🥳
