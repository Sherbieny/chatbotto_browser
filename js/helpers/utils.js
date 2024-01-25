
function isValid(text) {
    text = String(text);
    return text !== undefined && text !== null && text.trim() !== "" && text !== "undefined";
}

function linkify(inputText) {
    const urlRegex = /https?:\/\/[^\s]+/g;
    return inputText.replace(urlRegex, url => `<br/><br/><a href="${url}" target="_blank">${url}</a></br></br>`);
}

function sanitizeHTML(str) {
    const tempDiv = document.createElement('div');
    str = str.replace(/\n/g, '');  // This line removes all newline characters
    tempDiv.appendChild(document.createTextNode(str));
    return tempDiv.innerHTML;
}