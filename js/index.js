let app, mainView, suggestionsSheet, messages, messageBar, sendBtn, db, chatbot, $$;

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
            backdrop: true,
            swipeToClose: true,
            closeByOutsideClick: true,
        },
    });

    $$ = Dom7;
    mainView = app.views.create('.view-main');
    suggestionsSheet = app.sheet.get('#suggestions-sheet');
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

    //Dom Elements
    sendBtn = document.getElementById('send-btn');

});