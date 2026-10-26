# Registrations → Google Sheet (Apps Script web app)

The site's "Request an invite" form sends each registration straight to a Google Sheet. No Google Form, API key or token is involved.

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

- Columns: Timestamp (IST), Name, Age group, Mobile, Email, Instagram, How did you hear, Why join, Comfortable with strangers, Source page.
- Values starting with `=`, `+`, `-` or `@` are stored with a leading `'` so they're treated as text (so `+91…` numbers and `@handles` show as typed, and formulas can't be injected).
- Each field is trimmed and capped at 200 characters; the mobile number must be 10 digits (+91 / 0 prefixes are accepted).
- A hidden "company" field catches bots: if it's filled, the script replies OK but saves nothing.
- Because the browser sends the request in `no-cors` mode, the site can't read the script's reply. It shows the thank-you screen once the request is delivered, and the retry message only when the network fails.
- Anyone with the `/exec` URL can post to it (it's public by design); only you can read the Sheet.
