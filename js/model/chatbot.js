class Chatbot {
    constructor(framework7Instance, chatbotDBInstance) {
        this.framework7 = framework7Instance;
        this.db = chatbotDBInstance;
        this.qa = []; // Array of question-answer pairs
        this.tokenizer = new Tokenizer(this.db);
        this.suggestionsCount = 5;
    }

    async init() {
        await this.updateChatbotData();  // Get data from IndexedDB
        await this.tokenizer.init();  // Initialize tokenizer
        await this.getSettings();  // Get settings from IndexedDB

    }

    async updateChatbotData() {
        const data = await this.db.getChatbotData('qa');

        if (data) {
            data.forEach(item => {
                this.qa[item.prompt] = item.answer;
            });
        }
    }

    async getSettings() {
        const data = await this.db.getSettings();
        if (data && data.suggestionsCount) {
            this.suggestionsCount = data.suggestionsCount;
        }
    }

    async getChatbotPrompts() {
        if (this.qa.length === 0) {
            await this.updateChatbotData();
        }

        return Object.keys(this.qa);
    }

    calculateScore(tokenizedInput, tokenizedPrompt) {
        let score = 0;
        const weightMap = this.tokenizer.getWeightsMap();
        if (!weightMap) {
            throw new Error('Weights not found');
        }

        for (const [inputToken, inputTag] of tokenizedInput) {
            for (const [questionToken, questionTag] of tokenizedPrompt) {
                if (inputToken === questionToken) {
                    const weight = weightMap[questionTag] || 0;
                    score += weight;
                }
            }
        }

        return score;
    }

    getRandomSuggestions() {
        const prompts = Object.keys(this.qa);
        const suggestions = [];

        // If numSuggestions is greater than the number of prompts, reduce it to the number of prompts
        const numSuggestions = Math.min(this.suggestionsCount, prompts.length);

        for (let i = 0; i < numSuggestions; i++) {
            const randomIndex = Math.floor(Math.random() * prompts.length);
            const randomPrompt = prompts[randomIndex];
            suggestions.push(randomPrompt);

            // Remove the selected prompt from the array to avoid duplicates
            prompts.splice(randomIndex, 1);
        }

        return suggestions;
    }


    async getSuggestions(userInput) {

        if (!userInput) {
            return this.getRandomSuggestions();
        }

        const tokenizedInput = this.tokenizer.tokenizeString(userInput);
        const suggestions = [];
        const uniqueSuggestions = new Set();
        const tokenizedPrompts = await this.tokenizer.getTokenizedPrompts();
        const originalPrompts = await this.getChatbotPrompts();

        if (tokenizedInput.length === 0 || tokenizedPrompts.length === 0) {
            return [];
        }


        for (let i = 0; i < tokenizedPrompts.length; i++) {
            const tokenizedPrompt = tokenizedPrompts[i];
            const originalPromtp = originalPrompts[i];
            const score = this.calculateScore(tokenizedInput, tokenizedPrompt);

            if (score > 0 && !uniqueSuggestions.has(originalPromtp)) {
                suggestions.push({ text: originalPromtp, score });
                uniqueSuggestions.add(originalPromtp);
            }
        }

        return suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, this.suggestionsCount)
            .map(suggestion => suggestion.text);
    }

    async addSuggestions(userInput) {
        const suggestions = await this.getSuggestions(userInput);

        if (suggestions.length === 0) {
            return;
        }

        // Clear the previous suggestions
        suggestionsPanel.$el.find('#suggestions-list').empty();

        // Add the new suggestions
        suggestions.forEach(suggestion => {
            suggestionsPanel.$el.find('#suggestions-list').append(`
                <li>
                    <div class="item-content">
                        <div class="item-media"><i class="icon f7-icons">question_circle_fill</i></div>
                        <div class="item-inner">
                            <div class="suggestion-item">${suggestion}</div>
                        </div>
                    </div>
                </li>
            `);
        });

        // Open the suggestions sheet if it's not already open
        if (!suggestionsPanel.opened) {
            suggestionsPanel.open();
        }
    }

    async answer(userInput) {
        // Hide the suggestions sheet
        if (suggestionsPanel.opened) {
            suggestionsPanel.close();
        }

        // Add the user message to the chat
        messages.addMessage({
            header: new Date().toLocaleTimeString('ja-JP'),
            text: userInput,
            type: people.user.type,
            avatar: people.user.avatar,
        });

        // Add isTyping message
        messages.showTyping({
            avatar: people.chatbot.avatar,
        });

        // Get the chatbot's answer
        let answer = this.qa[userInput];
        if (!answer) {
            const suggestions = await this.getSuggestions(userInput);
            if (suggestions.length > 0) {
                answer = this.qa[suggestions[0]];
            }
        }

        if (!answer) {
            answer = 'すみません、よくわかりませんでした。';
        }

        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Hide the isTyping message
        messages.hideTyping();

        // Add the chatbot's answer to the chat
        messages.addMessage({
            header: new Date().toLocaleTimeString('ja-JP'),
            text: answer,
            type: people.chatbot.type,
            avatar: people.chatbot.avatar,
        });



        scrollToBottom('.messages-content');
    }
}