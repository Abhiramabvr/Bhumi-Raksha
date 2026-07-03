// QuestionManager.js - Load & randomize soal dari JSON
export class QuestionManager {
    constructor() {
        this.questions = [];
        this.usedIndices = [];
        this.byCategory = {};
    }

    async loadQuestions() {
        try {
            const response = await fetch('./data/questions.json');
            const data = await response.json();
            this.questions = data.questions;
            this._groupByCategory();
            console.log(`[QuestionManager] Loaded ${this.questions.length} questions`);
        } catch (error) {
            console.error('[QuestionManager] Failed to load questions:', error);
            this.questions = [];
        }
    }

    _groupByCategory() {
        this.byCategory = {};
        this.questions.forEach((q, idx) => {
            if (!this.byCategory[q.category]) {
                this.byCategory[q.category] = [];
            }
            this.byCategory[q.category].push(idx);
        });
    }

    getRandomQuestion() {
        const available = this.questions
            .map((_, idx) => idx)
            .filter(idx => !this.usedIndices.includes(idx));

        // Reset jika semua sudah terpakai
        if (available.length === 0) {
            this.usedIndices = [];
            return this.getRandomQuestion();
        }

        const randomIndex = available[Math.floor(Math.random() * available.length)];
        this.usedIndices.push(randomIndex);
        return this.questions[randomIndex];
    }

    getShuffledOptions(question) {
        // Buat array opsi dengan index aslinya
        const options = question.options.map((text, idx) => ({
            text,
            originalIndex: idx
        }));

        // Shuffle
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        // Temukan index correct yang baru setelah shuffle
        const newCorrectIndex = options.findIndex(
            opt => opt.originalIndex === question.correct
        );

        return {
            shuffledOptions: options.map(o => o.text),
            newCorrectIndex
        };
    }

    reset() {
        this.usedIndices = [];
    }

    getTotalCount() {
        return this.questions.length;
    }
}
