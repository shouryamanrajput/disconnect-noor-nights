/**
 * Disconnect's Diwali House Party: registration + payment receiver.
 *
 * Paste this whole file into the Google Sheet's Extensions > Apps Script editor
 * and deploy it as a Web app ("Execute as: Me", "Who has access: Anyone").
 * See SHEET-SETUP.md. No API keys, tokens or secrets are used.
 *
 * The site POSTs application/x-www-form-urlencoded (or a text/plain JSON
 * body) with mode: "no-cors". Two kinds of request:
 *
 * 1. Registration (no "action"):
 *      regId, name, ageGroup, mobile, email, instagram, heardFrom, why,
 *      comfortable, sourcePage, company (honeypot: must be empty)
 *    -> appends a row with Payment status "Pending payment".
 *
 * 2. Payment screenshot (action=payment):
 *      regId, name, mobile, email, fileName, mimeType, data (base64), company
 *    -> saves the image to the Drive folder "Disconnect Diwali Payments"
 *       (created if missing) as <RegID>_<name>.<ext>, finds the row by
 *       Registration ID (falling back to mobile) and sets Payment status to
 *       "Screenshot received" plus the file link.
 *
 * Adding Drive access means Google asks you to authorise again, and the web
 * app must be redeployed as a NEW VERSION of the existing deployment.
 */

var SHEET_NAME = 'Registrations';
var FOLDER_NAME = 'Disconnect Diwali Payments';
var HEADERS = [
  'Timestamp (IST)', 'Name', 'Age group', 'Mobile', 'Email', 'Instagram',
  'How did you hear', 'Why join', 'Comfortable with strangers', 'Source page',
  'Registration ID', 'Payment status', 'Payment screenshot'
];
var MAX_LEN = 200;
var MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // ~5 MB (the site sends ~500 KB)
var ALLOWED_MIME = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'image/heic': 'heic', 'image/heif': 'heif'
};
var REG_ID_RE = /^DSC-[A-Z0-9]{6}$/;

function doGet() {
  return json_({ ok: true, message: 'Disconnect Diwali registrations endpoint is running.' });
}

function doPost(e) {
  try {
    var data = parseBody_(e);

    // Honeypot: bots fill every field. Pretend success, save nothing.
    if (clean_(data.company)) return json_({ ok: true });

    if (clean_(data.action) === 'payment') return handlePayment_(data);
    return handleRegistration_(data);
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server_error', detail: String(err) });
  }
}

/* ── registration ────────────────────────────────────── */

function handleRegistration_(data) {
  var row = {
    name: clean_(data.name),
    ageGroup: clean_(data.ageGroup),
    mobile: clean_(data.mobile),
    email: clean_(data.email),
    instagram: clean_(data.instagram),
    heardFrom: clean_(data.heardFrom),
    why: clean_(data.why),
    comfortable: clean_(data.comfortable),
    sourcePage: clean_(data.sourcePage),
    regId: cleanRegId_(data.regId)
  };

  var mobile = normaliseMobile_(row.mobile);
  if (!mobile) return json_({ ok: false, error: 'invalid_mobile' });
  row.mobile = mobile;

  if (row.name.length < 2) return json_({ ok: false, error: 'missing_name' });
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(row.email)) {
    return json_({ ok: false, error: 'invalid_email' });
  }

  var byHeader = {
    'Timestamp (IST)': now_(),
    'Name': row.name,
    'Age group': row.ageGroup,
    'Mobile': row.mobile,
    'Email': row.email,
    'Instagram': row.instagram,
    'How did you hear': row.heardFrom,
    'Why join': row.why,
    'Comfortable with strangers': row.comfortable,
    'Source page': row.sourcePage,
    'Registration ID': row.regId,
    'Payment status': 'Pending payment',
    'Payment screenshot': ''
  };

  withLock_(function () {
    var sheet = getSheet_();
    appendByHeader_(sheet, byHeader);
    SpreadsheetApp.flush();
  });
  return json_({ ok: true, regId: row.regId });
}

/* ── payment screenshot ──────────────────────────────── */

function handlePayment_(data) {
  var regId = cleanRegId_(data.regId);
  var mobile = normaliseMobile_(clean_(data.mobile));
  var name = clean_(data.name);
  var email = clean_(data.email);
  if (!regId && !mobile) return json_({ ok: false, error: 'missing_reg_id' });

  var mime = clean_(data.mimeType).toLowerCase();
  if (mime === 'image/jpg') mime = 'image/jpeg';
  if (!ALLOWED_MIME.hasOwnProperty(mime)) return json_({ ok: false, error: 'invalid_type' });

  // Base64 (optionally a data: URL). Check the size before decoding.
  var b64 = String(data.data || '').replace(/^data:[^,]*,/, '').replace(/\s+/g, '');
  if (!b64) return json_({ ok: false, error: 'missing_file' });
  if (!/^[A-Za-z0-9+\/]+={0,2}$/.test(b64)) return json_({ ok: false, error: 'invalid_data' });
  if (Math.floor(b64.length * 3 / 4) > MAX_UPLOAD_BYTES) return json_({ ok: false, error: 'too_large' });

  var bytes = Utilities.base64Decode(b64);
  if (!bytes || !bytes.length) return json_({ ok: false, error: 'invalid_data' });
  if (bytes.length > MAX_UPLOAD_BYTES) return json_({ ok: false, error: 'too_large' });
  if (!looksLike_(bytes, mime)) return json_({ ok: false, error: 'invalid_type' });

  var fileName = (regId || 'NOID') + '_' + (safeFileName_(name) || mobile || 'guest') + '.' + ALLOWED_MIME[mime];

  var result = withLock_(function () {
    var folder = getFolder_();
    var file = folder.createFile(Utilities.newBlob(bytes, mime, fileName));
    file.setDescription('Payment screenshot for ' + (regId || mobile) + ' uploaded ' + now_());
    var url = file.getUrl();

    var sheet = getSheet_();
    var cols = ensureHeaders_(sheet);
    var r = findRow_(sheet, cols, regId, mobile);
    if (r) {
      sheet.getRange(r, cols['Payment status']).setValue('Screenshot received');
      sheet.getRange(r, cols['Payment screenshot']).setValue(url);
      if (regId) sheet.getRange(r, cols['Registration ID']).setValue(regId);
    } else {
      // No matching registration (e.g. sheet edited by hand): keep a record anyway.
      appendByHeader_(sheet, {
        'Timestamp (IST)': now_(),
        'Name': name,
        'Mobile': mobile,
        'Email': email,
        'Registration ID': regId,
        'Payment status': 'Screenshot received (no matching registration)',
        'Payment screenshot': url
      });
    }
    SpreadsheetApp.flush();
    return { matched: !!r, url: url };
  });
  return json_({ ok: true, matched: result.matched });
}

/* ── helpers ─────────────────────────────────────────── */

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // throws if it can't get the lock in 20 s
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function now_() {
  return Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
}

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

function cleanRegId_(v) {
  var s = clean_(v).toUpperCase();
  return REG_ID_RE.test(s) ? s : '';
}

/** 10 digits, optionally with +91 / 91 / 0 in front -> "+91XXXXXXXXXX", else "". */
function normaliseMobile_(v) {
  var digits = String(v || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.indexOf('91') === 0) digits = digits.slice(2);
  if (digits.length === 11 && digits.charAt(0) === '0') digits = digits.slice(1);
  return /^\d{10}$/.test(digits) ? '+91' + digits : '';
}

/** Letters, digits, spaces, dots, dashes only; max 40 chars. */
function safeFileName_(v) {
  return String(v || '').replace(/[^A-Za-z0-9 ._-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
}

/** Checks the file's magic bytes match the declared image type. */
function looksLike_(bytes, mime) {
  function b(i) { return bytes[i] & 0xff; } // Apps Script bytes are signed
  function str(i, n) { var s = ''; for (var k = 0; k < n; k++) s += String.fromCharCode(b(i + k)); return s; }
  if (bytes.length < 12) return false;
  if (mime === 'image/jpeg') return b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff;
  if (mime === 'image/png') return b(0) === 0x89 && str(1, 3) === 'PNG';
  if (mime === 'image/webp') return str(0, 4) === 'RIFF' && str(8, 4) === 'WEBP';
  if (mime === 'image/heic' || mime === 'image/heif') return str(4, 4) === 'ftyp';
  return false;
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

/**
 * Makes sure every header in HEADERS exists (missing ones, e.g. the payment
 * columns on an older sheet, are added at the end of row 1) and returns
 * { headerName: columnNumber }.
 */
function ensureHeaders_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var row = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var cols = {};
  for (var i = 0; i < row.length; i++) {
    var h = String(row[i]).trim();
    if (h && !cols[h]) cols[h] = i + 1;
  }
  var next = row.length;
  while (next > 0 && String(row[next - 1]).trim() === '') next--; // ignore trailing blanks
  for (var j = 0; j < HEADERS.length; j++) {
    if (!cols[HEADERS[j]]) {
      next++;
      sheet.getRange(1, next).setValue(HEADERS[j]).setFontWeight('bold');
      cols[HEADERS[j]] = next;
    }
  }
  return cols;
}

function appendByHeader_(sheet, byHeader) {
  var cols = ensureHeaders_(sheet);
  var width = 0;
  for (var h in cols) width = Math.max(width, cols[h]);
  var values = [];
  for (var i = 0; i < width; i++) values.push('');
  for (var key in byHeader) {
    if (cols[key]) values[cols[key] - 1] = safeCell_(byHeader[key] == null ? '' : byHeader[key]);
  }
  sheet.appendRow(values);
}

/** Newest row whose Registration ID matches; else newest row with the same mobile. */
function findRow_(sheet, cols, regId, mobile) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var n = last - 1;
  var r;
  if (regId) {
    var ids = sheet.getRange(2, cols['Registration ID'], n, 1).getValues();
    for (r = n - 1; r >= 0; r--) {
      if (String(ids[r][0]).trim().toUpperCase() === regId) return r + 2;
    }
  }
  if (mobile) {
    var mobiles = sheet.getRange(2, cols['Mobile'], n, 1).getValues();
    for (r = n - 1; r >= 0; r--) {
      if (normaliseMobile_(mobiles[r][0]) === mobile) return r + 2;
    }
  }
  return 0;
}

function getFolder_() {
  var it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
