/*
Usage:
To add more hashed emails into validEmails.csv, do the following:
1. Add the unhashed emails to validEmailsUnhashed.csv
2. Run this script using node validEmailsHashGenerator.js
3. The hashed emails will be added to validEmails.csv
4. The validEmails.csv file is used to check if the email is valid in the checkEmailValidity.js file
*/

const fs = require('fs');
const readline = require('readline');
const crypto = require('crypto');

const inputEmailsPath = './api/server/utils/emails/validEmailsUnhashed.csv';
const validEmailsPath = './api/server/utils/emails/validEmails.csv';

const hashEmail = (email) => {
  const hash = crypto.createHash('sha256');
  hash.update(email);
  return hash.digest('hex');
};

const readInterface = readline.createInterface({
  input: fs.createReadStream(inputEmailsPath),
  output: process.stdout,
  console: false,
});

let isFirstLine = true;

readInterface.on('line', (line) => {
  if (isFirstLine) {
    isFirstLine = false;
    return;
  }
  const hashedEmail = hashEmail(line);
  fs.appendFile(validEmailsPath, `${hashedEmail}\n`, (err) => {
    if (err) {throw err;}
  }); // Append the hashed email to validEmails.csv
});

readInterface.on('close', () => {
  console.log('\nvalidEmailsUnhashed file successfully processed');
});
