let db;

const request = indexedDB.open('common_cents', 1);

request.onupgradeneeded = function(e) {
    const db = e.target.result;
    db.createObjectStore('newTransaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        sendTransaction();
    };
};

request.onerror = function(event) {
    console.log(event.target.errorCode)
};

function saveRecord(record) {
    const transaction = db.transaction(['newTransaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('newTransaction');

    transactionObjectStore.add(record);
};

function sendTransaction() {
    const transaction = db.transaction(['newTransaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('newTransaction');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['newTransaction'], 'readwrite');

                    const budgetObjectStore = transaction.objectStore('newTransaction');

                    transactionObjectStore.clear();

                    alert('Transactions sent.')
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
};

window.addEventListener('online', sendTransaction);