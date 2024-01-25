class ChatbotIndexedDB {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('chatbotDataDB', 1);

            request.onerror = function (event) {
                console.log("Unable to open IndexedDB:", event.target.error);
                reject(event.target.error);
            };

            request.onupgradeneeded = function (event) {
                this.db = event.target.result;
                if (!this.db.objectStoreNames.contains('chatbotDataStore')) {
                    this.db.createObjectStore('chatbotDataStore', { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("IndexedDB opened successfully");
                resolve();
            };
        });
    }

    async saveChatbotData(data, key) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['chatbotDataStore'], 'readwrite');
                const store = transaction.objectStore('chatbotDataStore');

                // Delete the old data with the same key
                store.delete(key);

                // Save the entire data array as a single record with the provided key
                store.put({ id: key, data: data });

                transaction.oncomplete = function () {
                    console.log('Chatbot data saved to IndexedDB');
                    resolve();
                };

                transaction.onerror = function () {
                    reject(new Error("An error occurred while saving data to IndexedDB"));
                };

            } catch (error) {
                console.error(error);
                reject(new Error('An unexpected error occurred: ' + error));
            }
        });
    }

    async getChatbotData(key) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['chatbotDataStore'], 'readonly');
                const store = transaction.objectStore('chatbotDataStore');
                const request = store.get(key);

                request.onsuccess = function (event) {
                    const data = event.target.result;
                    console.log('Chatbot data retrieved from IndexedDB');
                    resolve(data.data);
                };

                request.onerror = function (event) {
                    reject(new Error("An error occurred while fetching data from IndexedDB"));
                };

            } catch (error) {
                console.error(error);
                reject(new Error('An unexpected error occurred: ' + error));
            }
        });
    }
}