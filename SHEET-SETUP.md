# Registrations → Google Sheet (Apps Script web app)

The site's "Request an invite" form sends each registration straight to a Google Sheet, then (step 2) the guest pays by UPI and uploads a payment screenshot, which the script saves to your Google Drive and links in the same row. No Google Form, API key or token is involved.

## ⚠️ Update for the payment step (do this now)

The payment step needs the **new** `scripts/sheet-apps-script.gs` and **Google Drive** access. Until you redeploy, registrations still save but screenshots are ignored.

1. Open the sheet → **Extensions → Apps Script**.
2. Select everything in `Code.gs`, **replace it** with the full contents of the new `scripts/sheet-apps-script.gs`, and click **Save** (💾).
3. (Recommended) Approve Drive access first: in the function dropdown at the top choose **getFolder_** → **Run**. Google shows **Review permissions** → pick your account → **Advanced → Go to (project) (unsafe)** → **Allow**. It now asks for Drive as well as Sheets. This run also creates the Drive folder **Disconnect Diwali Payments**.
4. **Deploy → Manage deployments** → select the existing Web app → **pencil (Edit)** → **Version: New version** → **Deploy**. If it asks to authorise again, approve it.
   Use *Manage deployments*, **not** *New deployment*, so the `/exec` URL (already in `lib/config.ts`) stays the same.
5. Test: register on the site with your own number, skip the actual payment, upload any image as the screenshot, and check that the row shows **Payment status = Screenshot received** with a Drive link, and that the file is in **My Drive → Disconnect Diwali Payments** as `DSC-XXXXXX_<name>.jpg`. Delete the test row and file afterwards.

**Payment QR:** the site shows `public/payment-qr.png` (currently ISHITA's UPI QR, ₹1,299). To change it, replace that file with a new QR image (square, white margin) and update `site.payment` in `lib/config.ts` (amount, `amountValue`, `upiId`, `payeeName`). If the file is missing the site shows a "QR coming soon" placeholder.

## One-time setup (about 5 minutes)

1. Go to <https://sheets.new> (signed in with the Google account that should own the data) and name the sheet, e.g. **Disconnect Diwali – Registrations**.
   You don't need to create the tab yourself: the script makes a **Registrations** tab with the header row on the first submission.
2. In the sheet, open **Extensions → Apps Script**.
3. Delete everything in `Code.gs`, paste the entire contents of `scripts/sheet-apps-script.gs`, and click **Save** (💾).
4. Click **Deploy → New deployment**. Click the gear icon next to "Select type" and choose **Web app**.
5. Set:
   - **Description:** `Diwali registrations v1`
   - **Execute as:** **Me** (your account)
   - **Who has access:** **Anyone**
   Then click **Deploy**.
6. **Authorize access** → choose your account. If you see "Google hasn't verified this app", click **Advanced → Go to (project name) (unsafe)** (it's your own script), then **Allow**.
7. Copy the **Web app URL**. It ends in **`/exec`** (not `/dev`).
8. Either send that URL to me, **or** paste it into `lib/config.ts`:
   ```ts
   sheetEndpoint: "https://script.google.com/macros/s/XXXXXXXX/exec",
   ```
   then rebuild/redeploy the site.
9. Check it: open the `/exec` URL in a browser. You should see `{"ok":true,"message":"Disconnect Diwali registrations endpoint is running."}`. Then submit a test registration on the site and confirm a row appears in the **Registrations** tab (delete the test row afterwards).

While `sheetEndpoint` is `""`, the site shows "Registrations open soon!" and sends nothing.

## After editing the script (redeploy)

Saving the code is **not** enough: the live URL keeps running the old version until you publish a new one.

1. **Deploy → Manage deployments**.
2. Select the existing Web app deployment → click the **pencil (Edit)** icon.
3. **Version → New version** (optionally update the description) → **Deploy**.

The `/exec` URL stays the same, so the site doesn't need changing. (Choosing "New deployment" instead would create a *new* URL that you'd have to paste into `lib/config.ts` again.)

## Notes

- Columns: Timestamp (IST), Name, Age group, Mobile, Email, Instagram, How did you hear, Why join, Comfortable with strangers, Source page, **Registration ID**, **Payment status**, **Payment screenshot**. If your sheet already has a header row without the last three, the script adds them at the end automatically (existing columns aren't moved). Rows are written by header name, so you can reorder columns.
- Each registration gets a Registration ID made on the site (e.g. `DSC-7KQ2MX`) and Payment status **Pending payment**. When the screenshot arrives the row is found by Registration ID (or, failing that, the newest row with the same mobile) and set to **Screenshot received** with the Drive file link. If no row matches, a new row marked "Screenshot received (no matching registration)" is added so nothing is lost. Verify the payment in your UPI app, then change the status by hand (e.g. "Paid ✔").
- Screenshots: JPG, PNG, WebP or HEIC only (type and file signature are both checked), max ~5 MB (the site shrinks them to about 1280 px / under 500 KB first). Files are saved privately in **Disconnect Diwali Payments** in your Drive; the link only opens for you (and anyone you share the folder with).
- Values starting with `=`, `+`, `-` or `@` are stored with a leading `'` so they're treated as text (so `+91…` numbers and `@handles` show as typed, and formulas can't be injected).
- Each field is trimmed and capped at 200 characters; the mobile number must be 10 digits (+91 / 0 prefixes are accepted).
- A hidden "company" field catches bots: if it's filled, the script replies OK but saves nothing.
- Because the browser sends the request in `no-cors` mode, the site can't read the script's reply. It moves to the payment step (and later the thank-you screen) once each request is delivered, and the retry message only when the network fails.
- Anyone with the `/exec` URL can post to it (it's public by design); only you can read the Sheet.
