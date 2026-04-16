/**
 * NLP Command Parser — inspired by COBA's cobcli command syntax
 *
 * Supported commands:
 *   accounts [search terms]
 *   details [search terms]
 *   transactions [from:date] [to:date] [since:date] [through:date] [min:amount] [max:amount] [contains:text] [account]
 *   transfer <amount> from <source> to <destination>
 *   pay <amount|minimum|statement|current> on <credit> with <source>
 */

/**
 * Parse a natural language date like "last week", "one month ago", "2024-01-01"
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  const str = dateStr.toLowerCase().trim();

  const now = new Date();

  // Relative dates
  if (str === 'today') return now;
  if (str === 'yesterday') {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return d;
  }

  // "last week" / "one week ago" / "last month"
  const weekMatch = str.match(/^(?:last week|one week ago|1 week ago|a week ago)$/);
  if (weekMatch) {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }

  const monthMatch = str.match(/^(?:last month|one month ago|1 month ago|a month ago)$/);
  if (monthMatch) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return d;
  }

  const yearMatch = str.match(/^(?:last year|one year ago|1 year ago|a year ago)$/);
  if (yearMatch) {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() - 1);
    return d;
  }

  // "N days/weeks/months ago"
  const nDaysAgo = str.match(/^(\d+)\s+days?\s+ago$/);
  if (nDaysAgo) {
    const d = new Date(now);
    d.setDate(d.getDate() - parseInt(nDaysAgo[1]));
    return d;
  }
  const nWeeksAgo = str.match(/^(\d+)\s+weeks?\s+ago$/);
  if (nWeeksAgo) {
    const d = new Date(now);
    d.setDate(d.getDate() - parseInt(nWeeksAgo[1]) * 7);
    return d;
  }
  const nMonthsAgo = str.match(/^(\d+)\s+months?\s+ago$/);
  if (nMonthsAgo) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - parseInt(nMonthsAgo[1]));
    return d;
  }

  // ISO date: 2024-01-01
  const isoDate = Date.parse(str);
  if (!isNaN(isoDate)) return new Date(isoDate);

  return null;
}

/**
 * Tokenize a command string respecting quoted strings
 */
function tokenize(input) {
  const tokens = [];
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  let match;
  while ((match = regex.exec(input)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[0]);
  }
  return tokens;
}

/**
 * Main parse function — returns { intent, params } or { intent: 'unknown' }
 */
function parseCommand(input) {
  if (!input || typeof input !== 'string') {
    return { intent: 'unknown', raw: input };
  }

  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();
  const tokens = tokenize(trimmed);

  if (!tokens.length) return { intent: 'unknown', raw: input };

  const firstWord = tokens[0].toLowerCase();

  // ── accounts / details ────────────────────────────────────────────────────
  if (firstWord === 'accounts' || firstWord === 'account') {
    const searchTerms = tokens.slice(1).filter(t => !t.startsWith('deduct'));
    const deductPending = tokens.some(t => t.toLowerCase().includes('deduct'));
    return { intent: 'accounts', params: { searchTerms, deductPending }, raw: trimmed };
  }

  if (firstWord === 'details' || firstWord === 'detail') {
    const searchTerms = tokens.slice(1);
    return { intent: 'details', params: { searchTerms }, raw: trimmed };
  }

  // ── transactions ──────────────────────────────────────────────────────────
  if (firstWord === 'transactions' || firstWord === 'transaction' || firstWord === 'history') {
    const params = {};
    const searchTerms = [];

    for (const token of tokens.slice(1)) {
      const t = token.toLowerCase();
      if (t.startsWith('from:') || t.startsWith('since:')) {
        params.from = parseDate(token.split(':').slice(1).join(':'));
      } else if (t.startsWith('to:') || t.startsWith('through:')) {
        params.to = parseDate(token.split(':').slice(1).join(':'));
      } else if (t.startsWith('min:')) {
        params.min = parseFloat(t.replace('min:', ''));
      } else if (t.startsWith('max:')) {
        params.max = parseFloat(t.replace('max:', ''));
      } else if (t.startsWith('contains:')) {
        params.contains = token.split(':').slice(1).join(':');
      } else {
        searchTerms.push(token);
      }
    }

    // Natural language: "transactions since last week"
    // Check if the tokens spell out "since <date phrase>"
    const sinceIdx = tokens.findIndex(t => t.toLowerCase() === 'since');
    if (sinceIdx !== -1 && !params.from) {
      const datePart = tokens.slice(sinceIdx + 1)
        .filter(t => !t.startsWith('min:') && !t.startsWith('max:') && !t.startsWith('contains:'))
        .join(' ');
      const parsed = parseDate(datePart.trim());
      if (parsed) {
        params.from = parsed;
        // Remove those tokens from searchTerms
        const toRemove = new Set(tokens.slice(sinceIdx).map(t => t.toLowerCase()));
        params._removedFromSearch = true;
      }
    }

    if (searchTerms.length) params.account = searchTerms.join(' ');

    return { intent: 'transactions', params, raw: trimmed };
  }

  // ── transfer ──────────────────────────────────────────────────────────────
  // Pattern: transfer <amount> from <source words> to <dest words>
  if (firstWord === 'transfer') {
    const rest = tokens.slice(1);
    const fromIdx = rest.findIndex(t => t.toLowerCase() === 'from');
    const toIdx = rest.findIndex(t => t.toLowerCase() === 'to');

    if (fromIdx === -1 || toIdx === -1 || fromIdx >= toIdx) {
      return {
        intent: 'transfer',
        params: {},
        error: 'Usage: transfer <amount> from <source> to <destination>',
        raw: trimmed,
      };
    }

    const amount = parseFloat(rest[0]);
    const fromAccount = rest.slice(fromIdx + 1, toIdx).join(' ');
    const toAccount = rest.slice(toIdx + 1).join(' ');

    return {
      intent: 'transfer',
      params: { amount, fromAccount, toAccount },
      raw: trimmed,
    };
  }

  // ── pay ───────────────────────────────────────────────────────────────────
  // Pattern: pay <amount|minimum|statement|current> on <credit> with <source>
  if (firstWord === 'pay') {
    const rest = tokens.slice(1);
    const onIdx = rest.findIndex(t => t.toLowerCase() === 'on');
    const withIdx = rest.findIndex(t => t.toLowerCase() === 'with');

    if (onIdx === -1 || withIdx === -1 || onIdx >= withIdx) {
      return {
        intent: 'pay',
        params: {},
        error: 'Usage: pay <amount|minimum|statement|current> on <credit account> with <source account>',
        raw: trimmed,
      };
    }

    const amountRaw = rest.slice(0, onIdx).join(' ').toLowerCase().trim();
    let paymentType = 'FIXED';
    let amount = null;

    if (amountRaw === 'minimum' || amountRaw === 'min') {
      paymentType = 'MINIMUM';
    } else if (amountRaw === 'statement') {
      paymentType = 'STATEMENT';
    } else if (amountRaw === 'current' || amountRaw === 'full') {
      paymentType = 'CURRENT';
    } else {
      amount = parseFloat(amountRaw);
      if (isNaN(amount)) {
        return {
          intent: 'pay',
          params: {},
          error: `Invalid amount: "${amountRaw}". Use a number, or "minimum", "statement", "current".`,
          raw: trimmed,
        };
      }
    }

    const creditAccount = rest.slice(onIdx + 1, withIdx).join(' ');
    const fromAccount = rest.slice(withIdx + 1).join(' ');

    return {
      intent: 'pay',
      params: { amount, paymentType, creditAccount, fromAccount },
      raw: trimmed,
    };
  }

  // ── help ──────────────────────────────────────────────────────────────────
  if (firstWord === 'help' || firstWord === '?') {
    return { intent: 'help', params: {}, raw: trimmed };
  }

  // ── admin ─────────────────────────────────────────────────────────────────
  if (firstWord === 'admin') {
    const rawArgs = tokens.slice(1).join(' ').toLowerCase();
    
    // admin create account <type> for <user_email>
    if (rawArgs.includes('create account') || rawArgs.includes('create checking') || rawArgs.includes('create savings') || rawArgs.includes('create business')) {
      const typeMatch = rawArgs.match(/(checking|savings|business|credit|heloc)/i);
      const emailMatch = rawArgs.match(/for\s+([^\s]+@[^\s]+\.[^\s]+)/i);
      
      return { 
        intent: 'admin_create_account', 
        params: { 
          type: typeMatch ? typeMatch[1].toUpperCase() : 'CHECKING',
          email: emailMatch ? emailMatch[1] : null,
          raw: rawArgs 
        }, 
        raw: trimmed 
      };
    }
    
    // admin block <account_number_last_4> reason <text>
    if (rawArgs.startsWith('block') || rawArgs.startsWith('lock')) {
      const accMatch = rawArgs.match(/(?:block|lock)\s+(\d{4})/i);
      const reasonMatch = rawArgs.match(/reason\s+(.+)$/i);
      
      return { 
        intent: 'admin_block_account', 
        params: { 
          accountNumber: accMatch ? accMatch[1] : null,
          reason: reasonMatch ? reasonMatch[1] : 'Administrative Hold',
          raw: rawArgs 
        }, 
        raw: trimmed 
      };
    }

    // admin inject transaction <amount> merchant <name> for <account_last_4>
    if (rawArgs.startsWith('inject transaction') || rawArgs.startsWith('add transaction')) {
      const amtMatch = rawArgs.match(/(?:transaction|add)\s+(-?\d+(?:\.\d+)?)/i);
      const merchMatch = rawArgs.match(/merchant\s+([^\s]+)/i);
      const accMatch = rawArgs.match(/for\s+(\d{4})/i);
      
      return { 
        intent: 'admin_inject_transaction', 
        params: { 
          amount: amtMatch ? parseFloat(amtMatch[1]) : 0,
          merchant: merchMatch ? merchMatch[1] : 'Adjustment',
          accountNumber: accMatch ? accMatch[1] : null,
          raw: rawArgs 
        }, 
        raw: trimmed 
      };
    }

    return { intent: 'admin_unknown', params: { raw: rawArgs }, raw: trimmed };
  }

  // ── clear ─────────────────────────────────────────────────────────────────
  if (firstWord === 'clear' || firstWord === 'cls') {
    return { intent: 'clear', params: {}, raw: trimmed };
  }

  return { intent: 'unknown', params: {}, raw: trimmed };
}

module.exports = { parseCommand, parseDate, tokenize };
