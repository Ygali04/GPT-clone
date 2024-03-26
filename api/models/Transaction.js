const mongoose = require('mongoose');
const { isEnabled } = require('../server/utils/handleText');
const transactionSchema = require('./schema/transaction');
const { getMultiplier } = require('./tx');
const Balance = require('./Balance');
const cancelRate = 1.15;

// Method to calculate and set the tokenValue for a transaction
transactionSchema.methods.calculateTokenValue = function () {
  if (!this.valueKey || !this.tokenType) {
    this.tokenValue = this.rawAmount;
  }
  const { valueKey, tokenType, model, endpointTokenConfig } = this;
  const multiplier = getMultiplier({ valueKey, tokenType, model, endpointTokenConfig });
  this.rate = multiplier;
  this.tokenValue = this.rawAmount * multiplier;
  if (this.context && this.tokenType === 'completion' && this.context === 'incomplete') {
    this.tokenValue = Math.ceil(this.tokenValue * cancelRate);
    this.rate *= cancelRate;
  }
};

// Static method to create a transaction and update the balance
transactionSchema.statics.create = async function (transactionData) {
  const Transaction = this;

  const transaction = new Transaction(transactionData);
  transaction.endpointTokenConfig = transactionData.endpointTokenConfig;
  transaction.calculateTokenValue();

  // Save the transaction
  await transaction.save();

  if (!isEnabled(process.env.CHECK_BALANCE)) {
    return;
  }

  // Adjust the user's balance
  const updatedBalance = await Balance.findOneAndUpdate(
    { user: transaction.user },
    { $inc: { tokenCredits: transaction.tokenValue } },
    { upsert: true, new: true },
  ).lean();

  return {
    rate: transaction.rate,
    user: transaction.user.toString(),
    balance: updatedBalance.tokenCredits,
    [transaction.tokenType]: transaction.tokenValue,
  };
};

const Transaction = mongoose.model('Transaction', transactionSchema);

/**
 * Queries and retrieves transactions based on a given filter.
 * @async
 * @function getTransactions
 * @param {Object} filter - MongoDB filter object to apply when querying transactions.
 * @returns {Promise<Array>} A promise that resolves to an array of matched transactions.
 * @throws {Error} Throws an error if querying the database fails.
 */
async function getTransactions(filter) {
  try {
    return await Transaction.find(filter).lean();
  } catch (error) {
    console.error('Error querying transactions:', error);
    throw error;
  }
}

module.exports = { Transaction, getTransactions };
