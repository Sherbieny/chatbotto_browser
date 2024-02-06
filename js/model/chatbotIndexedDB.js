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

    async saveChatbotData(data) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['chatbotDataStore'], 'readwrite');
                const store = transaction.objectStore('chatbotDataStore');

                // Delete the old data with the same key
                store.delete('qa');

                // Save the entire data array as a single record with the provided key
                store.put({ id: 'qa', data: data });

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

    async saveWeightsData(data) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['chatbotDataStore'], 'readwrite');
                const store = transaction.objectStore('chatbotDataStore');

                // Get the existing record with the key 'weights'
                const getRequest = store.get('weights');
                getRequest.onsuccess = function () {
                    const record = getRequest.result;
                    if (record) {
                        // Update the value field of each item in the record's data array
                        for (let item of data) {
                            const existingItem = record.data.find(x => x.key === item.key);
                            if (existingItem) {
                                existingItem.value = item.value;
                            }
                        }
                        // Save the updated record back to the store
                        store.put(record);
                    } else {
                        // If no existing record, save the entire data array as a single record with the key 'weights'
                        store.put({ id: 'weights', data: data });
                    }
                };

                transaction.oncomplete = function () {
                    console.log('Weights data saved to IndexedDB');
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

    async saveTokenizedChatbotPromptsData(data) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['chatbotDataStore'], 'readwrite');
                const store = transaction.objectStore('chatbotDataStore');

                // Delete the old data with the same key
                store.delete('tokenizedChatbotPrompts');

                // Save the entire data array as a single record with the provided key
                store.put({ id: 'tokenizedChatbotPrompts', data: data });

                transaction.oncomplete = function () {
                    console.log('Tokenized chatbot prompt data saved to IndexedDB');
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
                    if (data === undefined) {
                        reject(new Error(`No data found for key: ${key}`));
                    } else {
                        console.log('Chatbot data retrieved from IndexedDB');
                        resolve(data.data);
                    }
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

    async saveSettings(settings) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['chatbotDataStore'], 'readwrite');
                const store = transaction.objectStore('chatbotDataStore');

                // Save the settings object as a single record with the key 'settings'
                store.put({ id: 'settings', data: settings });

                transaction.oncomplete = function () {
                    console.log('Settings saved to IndexedDB');
                    resolve();
                };

                transaction.onerror = function () {
                    reject(new Error("An error occurred while saving settings to IndexedDB"));
                };

            } catch (error) {
                console.error(error);
                reject(new Error('An unexpected error occurred: ' + error));
            }
        });
    }

    async getSettings() {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['chatbotDataStore'], 'readonly');
                const store = transaction.objectStore('chatbotDataStore');
                const request = store.get('settings');

                request.onsuccess = function (event) {
                    const data = event.target.result;
                    if (data === undefined) {
                        reject(new Error(`No settings found in IndexedDB`));
                    } else {
                        console.log('Settings retrieved from IndexedDB');
                        resolve(data.data);
                    }
                };

                request.onerror = function (event) {
                    reject(new Error("An error occurred while fetching settings from IndexedDB"));
                };

            } catch (error) {
                console.error(error);
                reject(new Error('An unexpected error occurred: ' + error));
            }
        });
    }

    async isEmpty() {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['chatbotDataStore'], 'readonly');
                const store = transaction.objectStore('chatbotDataStore');
                const request = store.count();

                request.onsuccess = function (event) {
                    const count = event.target.result;
                    if (count === 0) {
                        console.log('Database is empty');
                        resolve(true);
                    } else {
                        console.log('Database is not empty');
                        resolve(false);
                    }
                };

                request.onerror = function (event) {
                    reject(new Error("An error occurred while checking if the database is empty"));
                };

            } catch (error) {
                console.error(error);
                reject(new Error('An unexpected error occurred: ' + error));
            }
        });
    }

    async populateSampleData() {
        // Sample data files are located in the 'sample_data' folder
        // qa_data.json: chatbot data
        // weights.json: weights data

        try {
            // Load chatbot data
            const qaData = await fetch('sample_data/qa_data.json');
            const qaJson = await qaData.json();
            await this.saveChatbotData(qaJson);

            // Load weights data
            const weightsData = await fetch('sample_data/weights.json');
            const weightsJson = await weightsData.json();
            await this.saveWeightsData(weightsJson);
        } catch (error) {
            console.error(error);
            throw new Error('An unexpected error occurred while loading sample data: ' + error);
        }
    }
}