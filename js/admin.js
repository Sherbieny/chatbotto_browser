let currentTablePage = 0;
let rowsPerPage = 10;
let tableData = [];
document.addEventListener('DOMContentLoaded', function () {
    $$(document).on('page:init', '.page[data-name="admin"]', function (e) {
        // CSV upload for table and qa data
        const uploadWeightsBtn = document.getElementById('csv-upload-weights');
        const uploadQABtn = document.getElementById('csv-upload-qa');
        const tablePrevBtn = document.getElementById('prev-page');
        const tableNextBtn = document.getElementById('next-page');
        const tablePageCountSelect = document.getElementById('page-count-select');
        const saveTableDataBtn = document.getElementById('save-table-data');
        const saveSettingsBtn = document.getElementById('save-settings');

        uploadWeightsBtn.addEventListener('change', function (event) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = async function (event) {
                let data;
                if (file.name.endsWith('.json')) {
                    data = JSON.parse(event.target.result);
                } else {
                    const csv = event.target.result;
                    const [header, ...rows] = csv.split('\n').map(line => line.split(','));
                    data = rows.map(row => {
                        let obj = {};
                        header.forEach((h, i) => obj[h] = row[i]);
                        return obj;
                    });
                }
                // Add to IndexedDB
                try {
                    // validate data
                    validateData(data, 'weights');
                    await db.saveWeightsData(data);
                    // Send notification
                    app.notification.create({
                        title: 'チャットボット',
                        text: 'データをアップロードしました。'
                    }).open();

                    // Update table data
                    updateTable();
                } catch (error) {
                    console.error(error);
                    app.notification.create({
                        title: 'チャットボット',
                        text: 'データのアップロードに失敗しました。'
                    }).open();
                }
            };
        });

        uploadQABtn.addEventListener('change', function (event) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = async function (event) {
                let data;
                if (file.name.endsWith('.json')) {
                    data = JSON.parse(event.target.result);
                } else {
                    const csv = event.target.result;
                    const [header, ...rows] = csv.split('\n').map(line => line.split(','));
                    data = rows.map(row => {
                        let obj = {};
                        header.forEach((h, i) => obj[h] = row[i]);
                        return obj;
                    });
                }
                // Add to IndexedDB
                try {
                    // validate data
                    validateData(data, 'qa');
                    await db.saveChatbotData(data);
                    // Send notification
                    app.notification.create({
                        title: 'チャットボット',
                        text: 'データをアップロードしました。'
                    }).open();
                } catch (error) {
                    console.error(error);
                    app.notification.create({
                        title: 'チャットボット',
                        text: 'データのアップロードに失敗しました。'
                    }).open();
                }
            };
        });

        // Save table data
        saveTableDataBtn.addEventListener('click', async function () {
            const table = document.getElementById('data-table');
            const tbody = table.getElementsByTagName('tbody')[0];
            const rows = tbody.getElementsByTagName('tr');
            const data = [];
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const cells = row.getElementsByTagName('td');
                const key = cells[0].textContent;
                const value = cells[3].getElementsByTagName('input')[0].value;
                data.push({
                    key: key,
                    value: value
                });
            }
            try {
                await db.saveWeightsData(data);
                // Send notification
                app.notification.create({
                    title: 'チャットボット',
                    text: 'データを保存しました。'
                }).open();
            } catch (error) {
                console.error(error);
                app.notification.create({
                    title: 'チャットボット',
                    text: 'データの保存に失敗しました。'
                }).open();
            }
        });

        // Table pagination
        tablePrevBtn.addEventListener('click', function () {
            currentTablePage = Math.max(currentTablePage - 1, 0);
            updateTable();
        });

        tableNextBtn.addEventListener('click', function () {
            currentTablePage = Math.min(currentTablePage + 1, Math.floor((tableData.length - 1) / rowsPerPage));
            updateTable();
        });

        tablePageCountSelect.addEventListener('change', function () {
            rowsPerPage = parseInt(this.value);
            if (this.value === 'all') {
                rowsPerPage = tableData.length;
            }
            currentTablePage = 0;
            updateTable();
        });

        // Get table data from IndexedDB if available
        try {
            db.getChatbotData('weights').then(data => {
                tableData = data;
                updateTable();
            }).catch(error => {
                console.error(error);
                app.notification.create({
                    title: 'チャットボット',
                    text: 'データの取得に失敗しました。'
                }).open();

            });
        } catch (error) {
            console.error(error);
            app.notification.create({
                title: 'チャットボット',
                text: 'データの取得に失敗しました。'
            }).open();
        }

        // Save settings
        saveSettingsBtn.addEventListener('click', async function () {
            const suggestionsCount = document.getElementById('suggestions-count').value;
            const suggestionsDelay = document.getElementById('suggestions-delay').value;

            try {
                await db.saveSettings({
                    suggestionsCount: suggestionsCount,
                    suggestionsDelay: suggestionsDelay
                });
                // Send notification
                app.notification.create({
                    title: 'チャットボット',
                    text: '設定を保存しました。'
                }).open();
            } catch (error) {
                console.error(error);
                app.notification.create({
                    title: 'チャットボット',
                    text: '設定の保存に失敗しました。'
                }).open();
            }
        });

        // Get settings from IndexedDB if available
        try {
            db.getSettings().then(settings => {
                document.getElementById('suggestions-count').value = settings.suggestionsCount;
                document.getElementById('suggestions-delay').value = settings.suggestionsDelay;
            }).catch(error => {
                console.error(error);
                app.notification.create({
                    title: 'チャットボット',
                    text: '設定の取得に失敗しました。'
                }).open();
            });
        } catch (error) {
            console.error(error);
            app.notification.create({
                title: 'チャットボット',
                text: '設定の取得に失敗しました。'
            }).open();
        }
    });
});

// Update table data
function updateTable() {
    const table = document.getElementById('data-table');
    const tbody = table.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    const start = currentTablePage * rowsPerPage;
    const end = start + rowsPerPage;
    tableData.slice(start, end).forEach(item => {
        const row = tbody.insertRow();
        const cell1 = row.insertCell();
        cell1.innerHTML = item.key;
        cell1.classList.add('label-cell');
        const cell2 = row.insertCell();
        cell2.innerHTML = item.label;
        cell2.classList.add('label-cell');
        const cell3 = row.insertCell();
        cell3.innerHTML = item.labelJP;
        cell3.classList.add('label-cell');
        const cell4 = row.insertCell();
        cell4.classList.add('numeric-cell');
        const input = document.createElement('input');
        input.type = 'number';
        // normalize the value between 0 and 3
        input.value = Math.min(Math.max(item.value, 0), 3);
        input.min = 0;
        input.max = 3;
        input.classList.add('cus-input-outline');
        cell4.appendChild(input);
    });

    // Update pagination
    const paginationLabel = document.querySelector('.data-table-pagination-label');
    paginationLabel.textContent = `${start + 1}-${end} of ${tableData.length}`;

    // Enable or disable the previous and next buttons
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    prevPageButton.classList.toggle('disabled', currentTablePage === 0);
    nextPageButton.classList.toggle('disabled', currentTablePage >= Math.floor((tableData.length - 1) / rowsPerPage));

    // Update page count select
    const pageCountSelect = document.getElementById('page-count-select');
    pageCountSelect.value = rowsPerPage === tableData.length ? 'all' : rowsPerPage;
}

// Validate data
function validateData(data, type) {
    // Check if the data is valid
    if (data.length === 0) {
        throw new Error('Empty data');
    }

    const expectedLength = type === 'weights' ? 4 : 2;

    data.forEach(item => {
        if (Object.keys(item).length !== expectedLength) {
            throw new Error('Invalid data length');
        }

        if (Object.values(item).some(value => !isValid(value))) {
            throw new Error('Invalid data');
        }
    });
}
