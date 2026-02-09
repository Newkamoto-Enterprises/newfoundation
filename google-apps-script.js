/**
 * Google Apps Script — Newfoundation Connect Form Webhook
 *
 * SETUP:
 * 1. Open your Google Sheet → Extensions → Apps Script
 * 2. Delete any existing code and paste this entire file
 * 3. Click Deploy → New deployment
 * 4. Type: Web app
 * 5. Execute as: Me  |  Who has access: Anyone
 * 6. Click Deploy, authorize, and copy the URL
 * 7. Paste that URL into script.js where GOOGLE_SHEET_URL is defined
 */

// Column headers — order matters, must match the row push below
var HEADERS = [
    'Timestamp',
    'Name',
    'Email',
    'Phone',
    'Location',
    'Affiliations',
    'Social Links',
    'Bio',
    'Role(s)',
    'Stack',
    'Portfolio / Work URLs',
    'Research Focus',
    'Publication / Work URLs',
    'Project Link',
    'Project Description',
    'Project Stage',
    'Governance Interests',
    'Interests',
    'Cultural Filter',
    'Referral',
    'Notes'
];

function doPost(e) {
    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        // Auto-create headers if the sheet is blank
        if (sheet.getLastRow() === 0) {
            sheet.appendRow(HEADERS);
            sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
        }

        var data = JSON.parse(e.postData.contents);

        // Helper: join arrays with commas
        function flat(val) {
            if (Array.isArray(val)) return val.filter(Boolean).join(', ');
            return val || '';
        }

        var row = [
            data.timestamp || new Date().toISOString(),
            flat(data.name),
            flat(data.email),
            flat(data.phone),
            flat(data.location),
            flat(data.affiliations),
            flat(data.socialLinks),
            flat(data.bio),
            flat(data.role),
            flat(data.stack),
            flat(data.portfolio),
            flat(data.researchFocus),
            flat(data.publication),
            flat(data.projectLink),
            flat(data.projectDescription),
            flat(data.projectStage),
            flat(data.govInterests),
            flat(data.interests),
            flat(data.culturalFilter),
            flat(data.referral),
            flat(data.notes)
        ];

        sheet.appendRow(row);

        return ContentService
            .createTextOutput(JSON.stringify({ result: 'success' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// Required for CORS preflight from browsers
function doGet(e) {
    return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok', message: 'Newfoundation Connect webhook is live.' }))
        .setMimeType(ContentService.MimeType.JSON);
}
