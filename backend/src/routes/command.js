const express = require('express');
const { body, validationResult } = require('express-validator');
const { parseCommand } = require('../utils/nlp-parser');
const { authenticate } = require('../middleware/auth');
const { listAccounts, getAccountDetails } = require('../services/accountService');
const { searchTransactions } = require('../services/transactionService');
const { executeTransfer } = require('../services/transferService');
const { executePayment } = require('../services/paymentService');

const router = express.Router();

router.post('/', authenticate,
  [
    body('command').trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Command cannot be empty' });
    }

    const { command } = req.body;
    const parsed = parseCommand(command);

    if (parsed.error) {
      return res.status(400).json({ error: parsed.error, stringOut: parsed.error });
    }

    const userId = req.user.id;

    try {
      switch (parsed.intent) {
        case 'accounts': {
          const { accounts } = await listAccounts(userId);
          let filtered = accounts;

          if (parsed.params.searchTerms && parsed.params.searchTerms.length > 0) {
            const searchRegexes = parsed.params.searchTerms.map(t => new RegExp(t, 'i'));
            filtered = accounts.filter(acc =>
              searchRegexes.some(regex => regex.test(acc.name) || regex.test(acc.accountNumber))
            );
          }

          let stringOut = '';
          filtered.forEach(acc => {
            stringOut += `${acc.name} (...${acc.accountNumber})\t${acc.balance.toFixed(2)}\n`;
          });
          if (!parsed.params.searchTerms || parsed.params.searchTerms.length === 0) {
            const total = filtered.reduce((sum, acc) => sum + (acc.type === 'CREDIT' ? 0 : acc.balance), 0);
            stringOut += `---\nBalance: ${total.toFixed(2)}`;
          }

          return res.json({ intent: 'accounts', data: filtered, stringOut: stringOut.trim() });
        }

        case 'details': {
          const { accounts } = await listAccounts(userId);
          let filtered = accounts;

          if (parsed.params.searchTerms && parsed.params.searchTerms.length > 0) {
            const searchRegexes = parsed.params.searchTerms.map(t => new RegExp(t, 'i'));
            filtered = accounts.filter(acc =>
              searchRegexes.some(regex => regex.test(acc.name) || regex.test(acc.accountNumber))
            );
          }

          if (filtered.length === 0) {
            return res.status(404).json({ error: 'No matching accounts found.', stringOut: 'No matching accounts found.' });
          }

          let stringOut = '';
          const detailsList = [];

          for (const acc of filtered) {
            const detailedAcc = await getAccountDetails(userId, acc.id);
            detailsList.push(detailedAcc);

            stringOut += `> details ${detailedAcc.name} (...${detailedAcc.accountNumber})\n`;
            stringOut += `-------------------------------------------------\n`;
            stringOut += `Present balance\t\t$${detailedAcc.balance.toFixed(2)}\n`;
            stringOut += `Available balance\t$${detailedAcc.availableBalance.toFixed(2)}\n`;

            if (detailedAcc.type === 'CREDIT') {
              stringOut += `Next payment due\t${detailedAcc.nextPaymentDue || 'N/A'}\n`;
              stringOut += `Total credit limit\t$${(detailedAcc.creditLimit || 0).toFixed(2)}\n`;
              stringOut += `Current balance\t\t$${Math.abs(detailedAcc.balance).toFixed(2)}\n`;
              stringOut += `Minimum payment due\t$${(detailedAcc.minimumPayment || 0).toFixed(2)}\n`;
            }
            stringOut += '\n';
          }

          return res.json({ intent: 'details', data: detailsList, stringOut: stringOut.trim() });
        }

        case 'transactions': {
          const filters = { limit: 20 };
          if (parsed.params.from) filters.from = parsed.params.from.toISOString();
          if (parsed.params.to) filters.to = parsed.params.to.toISOString();
          if (parsed.params.min !== undefined) filters.min = parsed.params.min;
          if (parsed.params.max !== undefined) filters.max = parsed.params.max;
          if (parsed.params.contains) filters.contains = parsed.params.contains;
          if (parsed.params.account) filters.account = parsed.params.account;

          const { transactions } = await searchTransactions(userId, filters);

          let stringOut = '';
          if (parsed.params.from && parsed.params.to) {
            stringOut += `Showing transactions since ${parsed.params.from.toDateString()} through ${parsed.params.to.toDateString()}:\n\n`;
          } else if (parsed.params.from) {
            stringOut += `Showing transactions since ${parsed.params.from.toDateString()}:\n\n`;
          } else {
            stringOut += `Showing recent transactions:\n\n`;
          }

          if (transactions.length === 0) {
            stringOut += 'No transactions found.';
          } else {
            transactions.forEach(tx => {
              const dateStr = new Date(tx.date).toISOString().split('T')[0];
              stringOut += `${tx.description.padEnd(30)} (${tx.category})\t${dateStr}\t${tx.amount.toFixed(2)}\n`;
            });
          }

          return res.json({ intent: 'transactions', data: transactions, stringOut: stringOut.trim() });
        }

        case 'transfer': {
          try {
            const result = await executeTransfer(userId, {
              amount: parsed.params.amount,
              fromAccount: parsed.params.fromAccount,
              toAccount: parsed.params.toAccount,
            });
            return res.json({ intent: 'transfer', data: result, stringOut: result.message });
          } catch (e) {
            const errStr = e.message;
            return res.status(e.status || 400).json({ error: errStr, stringOut: errStr });
          }
        }

        case 'pay': {
          try {
            const result = await executePayment(userId, {
              amount: parsed.params.amount || parsed.params.paymentType,
              creditAccount: parsed.params.creditAccount,
              fromAccount: parsed.params.fromAccount,
            });
            return res.json({ intent: 'pay', data: result, stringOut: result.message });
          } catch (e) {
            const errStr = e.message;
            return res.status(e.status || 400).json({ error: errStr, stringOut: errStr });
          }
        }

        case 'help': {
          const stringOut = `Redwood Crest Bank Command Engine
Available Commands:
  accounts [search]
  details [search]
  transactions [from:date] [to:date] [min:amt] [max:amt] [contains:text] [account:text]
  transfer <amount> from <source> to <destination>
  pay <amount|minimum|statement|current> on <credit> with <source>
  clear

Examples:
  transfer 200 from checking to savings
  transactions since last week min:25
  pay minimum on credit with checking`;
          return res.json({ intent: 'help', data: null, stringOut });
        }

        case 'clear': {
          return res.json({ intent: 'clear', data: null, stringOut: '' });
        }

        default:
          return res.status(400).json({ error: 'Unknown command', stringOut: 'Unknown command. Type "help" for a list of commands.' });
      }
    } catch (err) {
      console.error('[command handler]', err);
      res.status(500).json({ error: 'Failed to process command', stringOut: 'Internal server error while processing command.' });
    }
  }
);

module.exports = router;
