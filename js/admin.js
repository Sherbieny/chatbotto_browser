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
                    await db.saveChatbotData(data, 'weights');
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
                    await db.saveChatbotData(data, 'qa');
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

        // Table pagination
        tablePrevBtn.addEventListener('click', function () {
            currentTablePage = Math.max(currentTablePage - 1, 0);
            updateTable();
        });

        tableNextBtn.addEventListener('click', function () {
            currentTablePage = Math.min(currentTablePage + 1, Math.floor((tableData.length - 1) / rowsPerPage));
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
