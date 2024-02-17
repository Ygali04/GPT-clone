const fs = require('fs'); // Use fs.promises for async operations
const csv = require('csv-parser');
const crypto = require('crypto');

const validEmailsPath = './api/server/utils/emails/validEmails.csv';

const hashEmail = (email) => {
  const hash = crypto.createHash('sha256');
  hash.update(email);
  return hash.digest('hex');
};

const checkEmailValidity = async (req) => {
  const email = req.user.email;
  if (!email) {
    return false;
  }
  // Only allow emails that are in validEmails.csv
  const validEmails = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(validEmailsPath)
      .pipe(csv())
      .on('data', (row) => {
        validEmails.push(row.email); // Access the email using row.email
      })
      .on('end', () => {
        resolve();
      })
      .on('error', reject);
  });

  if (!validEmails.includes(hashEmail(email))) {
    return false;
  }

  return true;
};

module.exports = checkEmailValidity;
