let app, mainView, suggestionsPanel, messages, messageBar, db, chatbot, $$;
let lastMessageTime = 0;
let typingTimeout; // Rate limit in milliseconds
let suggestionsDelay = 2000; // Delay in milliseconds
let justSent = false; // Prevents getting suggestions after sending a message
const people = {
    user: {
        type: 'sent',
        avatar: 'img/user_icon.png'
    },
    chatbot: {
        type: 'received',
        avatar: 'img/chatbot_icon_1.png'
    },
};

document.addEventListener('DOMContentLoaded', async function () {

    app = new Framework7({
        // App root element
        el: '#app',
        // App Name
        name: 'チャットボット',
        // Suggestions panel
        panel: {
            el: '#suggestions-panel',
            resizable: true,
            swipe: true,
            swipeOnlyClose: true,
        },
        // Add default routes
        routes: [
            {
                name: 'admin',
                path: '/admin/',
                async: function ({ resolve }) {
                    fetch('./admin.html')
                        .then((res) => res.text())
                        .then(function (html) {
                            resolve({ content: html });
                        });
                },
            }
        ],
        // loader
        dialog: {
            preloaderTitle: '読み込み中...',
            progressTitle: '読み込み中...',
            buttonOk: 'OK',
        },
    });

    showSpinner();

    $$ = Dom7;
    mainView = app.views.create('.view-main');
    suggestionsPanel = app.panel.create({ el: '#suggestions-panel' });
    messages = app.messages.create({
        el: '.messages',
    });
    messageBar = app.messagebar.create({
        el: '.messagebar',
        attachments: [],
    });

    messages.addMessage({
        header: new Date().toLocaleTimeString('ja-JP'),
        text: 'こんにちは！',
        type: people.chatbot.type,
        avatar: people.chatbot.avatar,
    });

    messages.addMessage({
        header: new Date().toLocaleTimeString('ja-JP'),
        text: '私はチャットボットです。何かお困りですか？',
        type: people.chatbot.type,
        avatar: people.chatbot.avatar,
    });

    messages.addMessage({
        header: new Date().toLocaleTimeString('ja-JP'),
        text: '質問例を見るには、上記の『提案リスト』を開いてください。',
        type: people.chatbot.type,
        avatar: people.chatbot.avatar,
    });

    try {
        // Initialize IndexedDB
        const chatbotDB = new ChatbotIndexedDB();
        await chatbotDB.init();
        db = chatbotDB;

        // Initialize Chatbot
        chatbot = new Chatbot(app, db);
        await chatbot.init();

        // get suggestion delay setting if available
        const settings = await db.getSettings();
        if (settings && settings.suggestionsDelay) {
            suggestionsDelay = settings.suggestionsDelay;
        }

    } catch (error) {
        console.error('Failed to initialize database:', error);
        // Show a notification to the user
        app.notification.create({
            title: 'チャットボット',
            text: 'データベースの初期化に失敗しました。機能が制限される可能性があります。',
            closeTimeout: 3000,
        }).open();
    } finally {
        hideSpinner();
    }

    //Dom Elements
    const sendBtn = document.getElementById('send-btn');
    const messageField = document.getElementById('message-field');
    const suggestionsListBtn = document.getElementById('open-suggestions');

    //Event Listeners

    // Send message
    sendBtn.addEventListener('click', async function () {
        const userInput = messageField.value.trim();
        if (userInput.length === 0) {
            return;
        }
        messageBar.clear();
        await chatbot.answer(userInput)
        justSent = true; // Set the flag to true
    });

    messageField.addEventListener('keypress', async function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const userInput = messageField.value.trim();
            if (userInput.length === 0) {
                return;
            }
            messageBar.clear();
            await chatbot.answer(userInput)
            justSent = true; // Set the flag to true
        }
    });

    // Finished typing - add suggestions
    messageField.addEventListener('input', function (e) {
        clearTimeout(typingTimeout);

        if (this.value.length > 0) {
            typingTimeout = setTimeout(async () => {
                if (justSent) { // If the user has just sent a message
                    justSent = false; // Reset the flag
                    return; // Exit the function
                }
                await chatbot.addSuggestions(this.value);
            }, 2000);
        }
    });

    // Suggestion list items click event
    suggestionsPanel.el.querySelector('#suggestions-list').addEventListener('click', async function (e) {
        const suggestion = e.target.closest('.suggestion-item')?.textContent;
        if (suggestion) {
            await chatbot.answer(suggestion);
        }
    });

    // Open suggestions sheet and if empty, add random suggestions
    suggestionsListBtn.addEventListener('click', async function () {
        if (suggestionsPanel.el.querySelector('#suggestions-list').childElementCount === 0) {
            await chatbot.addSuggestions();
        }
    });

});