var app = new Framework7({
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


var mainView = app.views.create('.view-main');
var suggestionsSheet = app.sheet.get('#suggestions-sheet');
var messages = app.messages.create({
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
    ],
    firstMessageRule: function (message, previousMessage, nextMessage) {
        if (message.isTitle) return false;
        if (!previousMessage || previousMessage.type !== message.type || previousMessage.name !== message.name) return true;
        return false;
    },
    lastMessageRule: function (message, previousMessage, nextMessage) {
        if (message.isTitle) return false;
        if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name) return true;
        return false;
    },
    tailMessageRule: function (message, previousMessage, nextMessage) {
        if (message.isTitle) return false;
        if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name) return true;
        return false;
    }

});
var messageBar = app.messagebar.create({
    el: '.messagebar',
    attachments: [],
});