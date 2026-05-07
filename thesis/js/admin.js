// Sections Content Templates
const sections = {
    dashboard: `
        <header class="admin-header"><h1>System Overview</h1><div style="color:var(--success)">● Kiosk Online</div></header>
        <div class="stats-grid">
            <div class="stat-card"><h3>Total Revenue</h3><p class="value">₱0.00</p><span>Today</span></div>
            <div class="stat-card"><h3>Pages Printed</h3><p class="value">0</p><span>Total</span></div>
            <div class="stat-card"><h3>Active Sessions</h3><p class="value">0</p><span>Idle</span></div>
        </div>
        <div class="card-large">
            <h3>Hardware Status</h3>
            <div style="margin-top:20px;">
                <label>Black Ink</label>
                <div class="progress-bar"><div class="fill" style="width: 80%;"></div></div>
                <label>Color Ink</label>
                <div class="progress-bar"><div class="fill" style="width: 45%;"></div></div>
                <label>Paper Supply</label>
                <div class="progress-bar"><div class="fill" style="width: 90%;"></div></div>
            </div>
        </div>
    `,
    transactions: `
        <header class="admin-header"><h1>Transaction History</h1></header>
        <div class="card-large">
            <table>
                <thead><tr><th>Time</th><th>Service</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody><tr><td colspan="4" style="text-align:center; padding:40px; color:#999;">No data found.</td></tr></tbody>
            </table>
        </div>
    `,
    pricing: `
        <header class="admin-header"><h1>Pricing Setup</h1></header>
        <div class="card-large">
            <div class="pricing-grid">
                <div>
                    <h3>🖨️ Print Service</h3>
                    <div class="price-input"><label>B&W Rate</label><input type="number" id="p-bw" placeholder="0.00"></div>
                    <div class="price-input"><label>Color Rate</label><input type="number" id="p-color" placeholder="0.00"></div>
                </div>
                <div>
                    <h3>📂 Xerox Service</h3>
                    <div class="price-input"><label>B&W Rate</label><input type="number" id="x-bw" placeholder="0.00"></div>
                    <div class="price-input"><label>Color Rate</label><input type="number" id="x-color" placeholder="0.00"></div>
                </div>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <h3>🔍 Scan Service</h3>
            <div class="price-input" style="max-width:300px;"><label>Flat Rate</label><input type="number" id="s-flat" placeholder="0.00"></div>
            
            <div style="margin-top: 30px; text-align: right; border-top: 1px solid #eee; padding-top: 20px;">
                <button class="save-btn" onclick="saveAllPrices()" style="width: 200px;">Save All Pricing</button>
            </div>
        </div>
    `,
    maintenance: `
        <header class="admin-header"><h1>Maintenance & Security</h1></header>
        <div class="stats-grid">
            <div class="stat-card"><h3>Printer</h3><p style="color:var(--danger)">Offline</p><button class="save-btn">Connect</button></div>
            <div class="stat-card"><h3>Coin Slot</h3><p style="color:var(--success)">Ready</p><button class="save-btn">Test</button></div>
        </div>
        <div class="card-large" style="margin-top: 25px; max-width: 500px;">
            <h3>🔐 Change Admin Password</h3>
            <div class="price-input" style="margin-top: 15px;">
                <label>New Password</label>
                <div class="password-wrapper">
                    <input type="password" id="new-pass" placeholder="Enter new password">
                    <button type="button" class="eye-toggle" onclick="toggleField('new-pass', this)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.06"></path>
                            <path d="M22.9 12.2a15.42 15.42 0 0 1-5.13 5.12"></path>
                            <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"></path>
                            <path d="M1 1l22 22"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="price-input">
                <label>Confirm Password</label>
                <div class="password-wrapper">
                    <input type="password" id="confirm-pass" placeholder="Confirm new password">
                    <button type="button" class="eye-toggle" onclick="toggleField('confirm-pass', this)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.06"></path>
                            <path d="M22.9 12.2a15.42 15.42 0 0 1-5.13 5.12"></path>
                            <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"></path>
                            <path d="M1 1l22 22"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <button class="save-btn" onclick="updateAdminPassword()">Update Password</button>
        </div>
    `
};

// --- CORE FUNCTIONS ---

function showSection(sectionId) {
    document.getElementById('main-content-area').innerHTML = sections[sectionId];
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    document.getElementById('link-' + sectionId).classList.add('active');

    // If we are on the pricing section, fetch current data from the Cloud
    if(sectionId === 'pricing') loadCurrentPrices();
}

// ... (Keep your showSection function as is) ...

function saveAllPrices() {
    // 1. Collect values from inputs
    const pBW = document.getElementById('p-bw').value || 0;
    const pColor = document.getElementById('p-color').value || 0;
    const xBW = document.getElementById('x-bw').value || 0;
    const xColor = document.getElementById('x-color').value || 0;
    const sFlat = document.getElementById('s-flat').value || 0;

    // 2. Save to Firebase Firestore (This makes it "Live")
    db.collection("settings").doc("pricing").set({
        printBW: pBW,
        printColor: pColor,
        xeroxBW: xBW,
        xeroxColor: xColor,
        scanFlat: sFlat
    })
    .then(() => {
        alert("🚀 Prices updated successfully across all machines!");
    })
    .catch((error) => {
        console.error("Error updating prices: ", error);
        alert("❌ Failed to save prices. Check your connection.");
    });

    // 3. Optional: Keep LocalStorage as a backup
    localStorage.setItem('pBW', pBW);
    localStorage.setItem('pColor', pColor);
    localStorage.setItem('xBW', xBW);
    localStorage.setItem('xColor', xColor);
    localStorage.setItem('sFlat', sFlat);
}

function loadCurrentPrices() {
    // When the admin opens the pricing tab, show what is currently saved
    if (document.getElementById('p-bw')) {
        document.getElementById('p-bw').value = localStorage.getItem('pBW') || 0;
        document.getElementById('p-color').value = localStorage.getItem('pColor') || 0;
        document.getElementById('x-bw').value = localStorage.getItem('xBW') || 0;
        document.getElementById('x-color').value = localStorage.getItem('xColor') || 0;
        document.getElementById('s-flat').value = localStorage.getItem('s-flat') || 0;
    }
}

// --- UTILITY FUNCTIONS ---

function toggleField(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('svg');
    if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
    } else {
        input.type = 'password';
        icon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.06"></path><path d="M22.9 12.2a15.42 15.42 0 0 1-5.13 5.12"></path><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"></path><path d="M1 1l22 22"></path>`;
    }
}

function updateAdminPassword() {
    const newPass = document.getElementById('new-pass').value;
    const confirmPass = document.getElementById('confirm-pass').value;
    if (!newPass || !confirmPass) {
        alert("Please fill in both password fields.");
        return;
    }
    if (newPass !== confirmPass) {
        alert("Passwords do not match!");
        return;
    }
    localStorage.setItem('admin_password', newPass);
    alert("Password updated successfully!");
    document.getElementById('new-pass').value = "";
    document.getElementById('confirm-pass').value = "";
}

// Initialize Dashboard on load
window.onload = () => showSection('dashboard');