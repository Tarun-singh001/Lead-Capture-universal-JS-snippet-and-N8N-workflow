// Get lead data from the previous node
const leadData = $input.item.json;

// Extract fields with fallbacks
const name = leadData.name || '';
const email = leadData.email || '';
const phone = leadData.phone || '';
const message = leadData.message || '';

// Initialize spam indicator counters
let spamIndicators = [];

// 1) EMAIL SPAM DETECTION
const emailLower = email.toLowerCase();
const emailTestKeywords = ['test', 'spam', 'fake', 'example', 'noreply'];
const hasEmailTestKeyword = emailTestKeywords.some(k => emailLower.includes(k));
const disposableDomains = [
  'tempmail', 'guerrillamail', '10minutemail', 'throwaway',
  'mailinator', 'trashmail', 'yopmail', 'temp-mail'
];
const isDisposableEmail = disposableDomains.some(d => emailLower.includes(d));
const isMissingAtSymbol = !email.includes('@');
const isEmailTooShort = email.length < 5;
if (hasEmailTestKeyword || isDisposableEmail || isMissingAtSymbol || isEmailTooShort) {
  spamIndicators.push('suspicious email');
}

// 2) NAME SPAM DETECTION
const nameLower = name.toLowerCase();
const testNames = ['test', 'asdf', 'qwerty', 'admin', 'user', 'demo'];
const isTestName = testNames.some(n => nameLower.includes(n));
const isNameTooShort = name.length < 2;
const isAllNumbers = /^\d+$/.test(name);          // all digits
const isRepeatedChars = /^(.)\1+$/.test(name);    // same char repeated (e.g., 'aaaa')
const isSingleCharRepeated = name.replace(/\s/g, '').length === 1;
if (isTestName || isNameTooShort || isAllNumbers || isRepeatedChars || isSingleCharRepeated) {
  spamIndicators.push('suspicious name');
}

// 3) PHONE SPAM DETECTION
const phoneDigits = phone.replace(/\D/g, '');     // strip non-digits
const fakePhonePatterns = [
  '5555555', '0000000', '1234567', '9999999',
  '1111111', '2222222', '3333333', '4444444',
  '6666666', '7777777', '8888888'
];
const isFakePhonePattern = fakePhonePatterns.some(p => phoneDigits.includes(p));
const isAllSameDigit = /^(\d)\1+$/.test(phoneDigits);
const isPhoneTooShort = phoneDigits.length < 7;
const isPhoneTooLong = phoneDigits.length > 15;
if (isFakePhonePattern || isAllSameDigit || isPhoneTooShort || isPhoneTooLong) {
  spamIndicators.push('suspicious phone');
}

// 4) MESSAGE SPAM DETECTION
const messageLower = message.toLowerCase();
const isMessageTooShort = message.length < 10;
const spamKeywords = [
  'viagra', 'casino', 'lottery', 'winner', 'congratulations',
  'click here', 'buy now', 'limited time', 'act now', 'free money',
  'nigerian prince', 'inheritance', 'bitcoin', 'crypto investment'
];
const hasSpamKeyword = spamKeywords.some(k => messageLower.includes(k));
const isAllCaps = message === message.toUpperCase() && message.length > 5;
const hasExcessivePunctuation = /[!?]{3,}/.test(message);
const urlCount = (message.match(/https?:\/\//g) || []).length;
const hasTooManyUrls = urlCount > 2;
const isTestMessage = ['test', 'testing', 'asdf', 'hello'].includes(messageLower.trim());
if (isMessageTooShort || hasSpamKeyword || isAllCaps || hasExcessivePunctuation || hasTooManyUrls || isTestMessage) {
  spamIndicators.push('suspicious message');
}

// 5) MISSING DATA DETECTION
const requiredFields = [name, email, phone, message];
const missingFieldsCount = requiredFields.filter(f => !f || f === 'Not provided' || f.trim() === '').length;
if (missingFieldsCount >= 3) {
  spamIndicators.push(`${missingFieldsCount} required fields missing`);
}

// FINAL CLASSIFICATION (threshold = 2)
const isSpam = spamIndicators.length >= 2;
let reason;
if (isSpam) {
  reason = `Multiple spam indicators detected (fallback rules): ${spamIndicators.join(', ')}`;
} else if (spamIndicators.length === 1) {
  reason = `Minor concern detected (fallback rules): ${spamIndicators[0]}, but overall appears legitimate`;
} else {
  reason = 'Passed basic validation (fallback rules)';
}

return {
  status: isSpam ? 'Possible Spam' : 'New Lead',
  reason,
  spamIndicatorCount: spamIndicators.length,
  indicators: spamIndicators,
  ...leadData
};