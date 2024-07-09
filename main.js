function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        alert('No file selected');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, {type: 'binary'});
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        document.getElementById('dataOutput').innerHTML = JSON.stringify(json, null, 2);

        const jsCode = generateJSCode(json);
        document.getElementById('jsCodeOutput').innerHTML = jsCode;

        const pythonCode = generatePythonCode(json);
        document.getElementById('pythonCodeOutput').innerHTML = pythonCode;
    };
    reader.readAsBinaryString(file);
}

function generateJSCode(data) {
    const dataArray = JSON.stringify(data, null, 2);
    return `
/*
 * Include the Firebase library and initialize the app.
 * Paste your Firebase project configuration in the firebaseConfig object.
 */
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

const data = ${dataArray};
data.forEach((item, index) => {
    db.collection('your-collection').add(item)
        .then(() => {
            console.log('Document ' + index + ' successfully written!');
        })
        .catch((error) => {
            console.error('Error writing document: ', error);
        });
});
`;
}

function generatePythonCode(data) {
    return `
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate('path/to/firebase/key.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Data to add
data = ${JSON.stringify(data, null, 2)}

# Adding data to Firestore
for index, record in enumerate(data):
    db.collection('your-collection').add(record)
        .then(lambda ref: print('Added document with ID: ', ref.id))
        .catch(lambda error: print('Error adding document: ', error))
`;
}

function copyToClipboard(elementId) {
    const copyText = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(copyText).then(() => {
        alert('Copied to clipboard');
    }).catch(err => {
        alert('Failed to copy: ', err);
    });
}