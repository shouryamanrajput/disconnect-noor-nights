/**
 * Disconnect's Diwali House Party: registration receiver.
 *
 * Paste this whole file into the Google Sheet's Extensions > Apps Script editor
 * and deploy it as a Web app ("Execute as: Me", "Who has access: Anyone").
 * See SHEET-SETUP.md. No API keys, tokens or secrets are used.
 *
 * The site POSTs either application/x-www-form-urlencoded (default) or a
 * text/plain JSON body, with mode: "no-cors". Payload keys:
 *   name, ageGroup, mobile, email, instagram, heardFrom, why, comfortable,
 *   sourcePage, company (honeypot: must be empty)
 */

var SHEET_NAME = 'Registrations';
var HEADERS = [
  'Timestamp (IST)', 'Name', 'Age group', 'Mobile', 'Email', 'Instagram',
  'How did you hear', 'Why join', 'Comfortable with strangers', 'Source page'
];
var MAX_LEN = 200;

function doGet() {
  return json_({ ok: true, message: 'Disconnect Diwali registrations endpoint is running.' });
}

function doPost(e) {
  try {
    var data = parseBody_(e);

    // Honeypot: bots fill every field. Pretend success, save nothing.
    if (clean_(data.company)) return json_({ ok: true });

    var row = {
      name: clean_(data.name),
      ageGroup: clean_(data.ageGroup),
      mobile: clean_(data.mobile),
      email: clean_(data.email),
      instagram: clean_(data.instagram),
      heardFrom: clean_(data.heardFrom),
      why: clean_(data.why),
      comfortable: clean_(data.comfortable),
      sourcePage: clean_(data.sourcePage)
    };

    // Mobile: accept 10 digits, optionally with +91 / 91 / 0 in front.
    var digits = row.mobile.replace(/\D/g, '');
    if (digits.length === 12 && digits.indexOf('91') === 0) digits = digits.slice(2);
    if (digits.length === 11 && digits.charAt(0) === '0') digits = digits.slice(1);
    if (!/^\d{10}$/.test(digits)) return json_({ ok: false, error: 'invalid_mobile' });
    row.mobile = '+91' + digits;

    if (row.name.length < 2) return json_({ ok: false, error: 'missing_name' });
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(row.email)) {
      return json_({ ok: false, error: 'invalid_email' });
    }

    var values = [
      Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss'),
      row.name, row.ageGroup, row.mobile, row.email, row.instagram,
      row.heardFrom, row.why, row.comfortable, row.sourcePage
    ].map(safeCell_);

    var lock = LockService.getScriptLock();
    lock.waitLock(20000); // throws if it can't get the lock in 20 s
    try {
      var sheet = getSheet_();
      sheet.appendRow(values);
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server_error' });
  }
}

/* ── helpers ─────────────────────────────────────────── */

/** Reads form-urlencoded (e.parameter) or a JSON body (text/plain or application/json). */
function parseBody_(e) {
  var out = {};
  if (e && e.parameter) {
    for (var k in e.parameter) out[k] = e.parameter[k];
  }
  var raw = e && e.postData && e.postData.contents;
  var type = (e && e.postData && e.postData.type) || '';
  if (raw && type.indexOf('application/x-www-form-urlencoded') === -1) {
    try {
      var obj = JSON.parse(raw);
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        for (var j in obj) out[j] = obj[j];
      }
    } catch (ignore) {
      // Not JSON: keep whatever came through e.parameter.
    }
  }
  return out;
}

/** String-ify, strip control characters, collapse whitespace, trim, cap length. */
function clean_(v) {
  if (v === null || v === undefined) return '';
  var s = String(v)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return s.length > MAX_LEN ? s.slice(0, MAX_LEN) : s;
}

/** Stop formula injection: anything starting with = + - @ is stored as text. */
function safeCell_(v) {
  var s = String(v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
