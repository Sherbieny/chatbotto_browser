/**
 * Return true if string is not null, undefined, empty or whitespace.
 */
function isValid(text) {
    text = String(text);
    return text !== undefined && text !== null && text.trim() !== "" && text !== "undefined";
}

/**
 * Return urls as anchor tags in the specified text.
 * @returns {String}
 */
function linkify(inputText) {
    const urlRegex = /https?:\/\/[^\s]+/g;
    return inputText.replace(urlRegex, url => `<br/><br/><a href="${url}" target="_blank">${url}</a></br></br>`);
}

/**
 * Cleans the specified text of HTML tags and returns it.
 */
function sanitizeHTML(str) {
    const tempDiv = document.createElement('div');
    str = str.replace(/\n/g, '');  // This line removes all newline characters
    tempDiv.appendChild(document.createTextNode(str));
    return tempDiv.innerHTML;
}


/**
 * Shows a spinner on the specified element or on whole page
 * @param {HTMLElement} elem - The element to show the spinner on.
 */
function showSpinner(elem) {
    if (elem) {
        app.preloader.showIn(elem, 'multi');
    } else {
        app.dialog.preloader();
    }
}
/**
 * Hide Spinner on the specified element or on whole page
 * @param {HTMLElement} [elem] - The element containing the spinner to be hidden.
 */
function hideSpinner(elem) {
    if (elem) {
        app.preloader.hideIn(elem);
    } else {
        app.dialog.close();
    }
}