let app, mainView, suggestionsSheet, messages, messageBar, db, chatbot, $$;
let lastMessageTime = 0;
let typingTimeout; // Rate limit in milliseconds
let userInputLimit = 200; // Maximum length of user input

document.addEventListener('DOMContentLoaded', async function () {

    app = new Framework7({
        // App root element
        el: '#app',
        // App Name
        name: 'チャットボット',
        // Enable swipe panel
        panel: {
            swipe: true,
        },
        // Add default routes
        routes: [
            {
                name: 'admin',
                path: '/admin/',
                url: './admin.html',
            },
        ],
        // suggestions sheet modal
        sheet: {
            el: '#suggestions-sheet',
            backdrop: false,
            swipeToClose: true,
            closeByOutsideClick: true,
        },
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
    suggestionsSheet = app.sheet.create({ el: '#suggestions-sheet' });
    messages = app.messages.create({
        el: '.messages',
        messages: [
            {
                text: 'こんにちは！本日はどのようにお手伝いできますか？',
                type: 'sent',
                avatar: 'img/chatbot_icon_1.png'
            },
            {
                text: 'こんにちは！',
                type: 'received',
                avatar: 'img/user_icon.png'
            },
        ]
    });
    messageBar = app.messagebar.create({
        el: '.messagebar',
        attachments: [],
    });

    try {
        // Initialize IndexedDB
        const chatbotDB = new ChatbotIndexedDB();
        await chatbotDB.init();
        db = chatbotDB;
    } catch (error) {
        console.error('Failed to initialize database:', error);
        // Show a notification to the user
        app.notification.create({
            title: 'チャットボット',
            text: 'データベースの初期化に失敗しました。機能が制限される可能性があります。',
            closeTimeout: 3000,
        }).open();
    }

    // Initialize Chatbot
    chatbot = new Chatbot(app, db);
    await chatbot.init();


    //Dom Elements
    const sendBtn = document.getElementById('send-btn');
    const meesageField = document.getElementById('message-field');

    //Event Listeners

    // Send message
    sendBtn.addEventListener('click', function () {
        const userInput = meesageField.value;
        if (userInput.length === 0) {
            return;
        }
        chatbot.answer(userInput)
    });
    meesageField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const userInput = meesageField.value;
            if (userInput.length === 0) {
                return;
            }
            chatbot.answer(userInput)
        }
    });

    // Finished typing - add suggestions
    meesageField.addEventListener('change', function (e) {
        clearTimeout(typingTimeout);

        if (this.value.length > 0) {
            typingTimeout = setTimeout(() => {
                chatbot.addSuggestions(this.value);
            }, 2000);
        }
    });

    hideSpinner();

});