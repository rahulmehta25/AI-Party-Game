/* ========================================
   AI PARTY GAME - BACKEND SERVER
   Real AI judging with Claude API 🤖
   ======================================== */

import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config();

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

const MODEL = 'claude-3-haiku-20240307';

// ========================================
// PROMPT BATTLE - Judge creativity/humor
// ========================================
app.post('/api/judge-prompt-battle', async (req, res) => {
    try {
        const { prompt, answers } = req.body;
        
        if (!prompt || !answers || answers.length === 0) {
            return res.status(400).json({ error: 'Missing prompt or answers' });
        }

        const answersList = answers.map((a, i) => 
            `Answer ${i + 1} (by ${a.playerName}): "${a.text}"`
        ).join('\n');

        const response = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 500,
            messages: [{
                role: 'user',
                content: `You are the hilarious AI judge for a party game called "Prompt Battle". Players compete to write the funniest, most creative responses to prompts.

PROMPT: "${prompt}"

ANSWERS:
${answersList}

Your job:
1. Pick the WINNER (the funniest/most creative answer)
2. Write a SHORT, witty judgment (1-2 sentences max) explaining why they won
3. Be entertaining! Use humor, wordplay, or roast them lovingly

Respond in this exact JSON format:
{
  "winnerId": <number 0-${answers.length - 1} for which answer won>,
  "judgment": "<your funny 1-2 sentence judgment>",
  "scores": [<array of scores 0-100 for each answer in order>]
}`
            }]
        });

        const text = response.content[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response');
        }

        const result = JSON.parse(jsonMatch[0]);
        res.json({
            winnerId: answers[result.winnerId]?.playerId,
            judgment: result.judgment,
            scores: result.scores
        });

    } catch (error) {
        console.error('Judge error:', error);
        res.status(500).json({ error: 'AI judging failed', details: error.message });
    }
});

// ========================================
// STORY BUILDER - Rate story contributions
// ========================================
app.post('/api/judge-story', async (req, res) => {
    try {
        const { currentStory, storyPrompt, contributions } = req.body;
        
        if (!contributions || contributions.length === 0) {
            return res.status(400).json({ error: 'Missing contributions' });
        }

        const contribList = contributions.map((c, i) => 
            `Contribution ${i + 1} (by ${c.playerName}): "${c.text}"`
        ).join('\n');

        const response = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 500,
            messages: [{
                role: 'user',
                content: `You are the AI judge for "Story Builder" - a collaborative storytelling party game.

STORY SO FAR: "${currentStory}"

STORY PROMPT FOR THIS ROUND: "${storyPrompt}"

PLAYER CONTRIBUTIONS:
${contribList}

Your job:
1. Pick the BEST contribution that continues the story most entertainingly
2. Consider: creativity, humor, how well it follows the prompt, narrative flow
3. Write a SHORT, fun judgment (1-2 sentences)

Respond in this exact JSON format:
{
  "winnerId": <number 0-${contributions.length - 1}>,
  "judgment": "<your witty judgment>",
  "scores": [<array of scores 0-100 for each contribution>]
}`
            }]
        });

        const text = response.content[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response');
        }

        const result = JSON.parse(jsonMatch[0]);
        res.json({
            winnerId: contributions[result.winnerId]?.playerId,
            judgment: result.judgment,
            scores: result.scores
        });

    } catch (error) {
        console.error('Story judge error:', error);
        res.status(500).json({ error: 'AI judging failed', details: error.message });
    }
});

// ========================================
// AI TRIVIA - Generate real trivia questions
// ========================================
app.post('/api/generate-trivia', async (req, res) => {
    try {
        const { count = 5, categories } = req.body;

        const categoryList = categories?.length > 0 
            ? categories.join(', ')
            : 'Science, Pop Culture, History, Technology, Nature, Space, Food, Random Fun Facts';

        const response = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 2000,
            messages: [{
                role: 'user',
                content: `Generate ${count} fun, surprising trivia questions for a party game. Make them interesting and entertaining!

Categories to include: ${categoryList}

Requirements:
- Questions should be fun and surprising (not boring textbook facts)
- Include "wow factor" facts that make people go "wait, really?!"
- 4 answer options each, only one correct
- Short explanation for the correct answer

Respond in this exact JSON format:
{
  "questions": [
    {
      "category": "Category Name",
      "question": "The question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": <0-3 index of correct answer>,
      "explanation": "Brief fun explanation"
    }
  ]
}`
            }]
        });

        const text = response.content[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response');
        }

        const result = JSON.parse(jsonMatch[0]);
        res.json(result);

    } catch (error) {
        console.error('Trivia generation error:', error);
        res.status(500).json({ error: 'Trivia generation failed', details: error.message });
    }
});

// ========================================
// GENERATE CREATIVE PROMPTS
// ========================================
app.post('/api/generate-prompts', async (req, res) => {
    try {
        const { count = 5, theme } = req.body;

        const themeInstruction = theme 
            ? `Theme: ${theme}` 
            : 'Themes: random, absurd, creative, pop culture, hypotheticals';

        const response = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 1000,
            messages: [{
                role: 'user',
                content: `Generate ${count} creative, funny prompts for a party game where players write humorous responses.

${themeInstruction}

Make prompts that:
- Are open-ended and inspire creativity
- Have potential for humor
- Work for all ages (keep it clean)
- Are similar to: "What would a dog's resume look like?" or "Explain quantum physics like a disappointed parent"

Respond in JSON format:
{
  "prompts": ["prompt 1", "prompt 2", ...]
}`
            }]
        });

        const text = response.content[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response');
        }

        const result = JSON.parse(jsonMatch[0]);
        res.json(result);

    } catch (error) {
        console.error('Prompt generation error:', error);
        res.status(500).json({ error: 'Prompt generation failed', details: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', ai: 'claude-3-haiku' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🎉 AI Party Game server running on port ${PORT}`);
    console.log(`🤖 Using Claude model: ${MODEL}`);
});
