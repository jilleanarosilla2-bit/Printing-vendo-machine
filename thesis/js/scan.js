/* js/scan.js */

// --- STEP 1: INITIAL STATE & PRICES ---
// UPDATED: Pull from the exact key used in admin.js ('sFlat')
// Default is now 0 to match your "start at zero" requirement
let scanPrice = 0;
let insertedBalance = 0;
let format = 'pdf';
let target = 'usb';

// NEW: Firebase Live Listener for Scan (Starting at Line 11)
db.collection("settings").doc("pricing").onSnapshot((doc) => {
    if (doc.exists) {
        const data = doc.data();
        
        // Match the key 'scanFlat' used in your admin.js
        scanPrice = parseFloat(data.scanFlat) || 0;

        // Run your existing UI update function
        if (typeof updateUI === "function") {
            updateUI();
        }
        
        console.log("Scan price synced from Cloud:", scanPrice);
    }
});

// --- STEP 2: SELECTION HANDLERS ---
function setTarget(val, btn) {
    target = val;
    toggleActive(btn);
}

function setFormat(val, btn) {
    format = val;
    toggleActive(btn);
}

function toggleActive(btn) {
    const btns = btn.parentElement.querySelectorAll('.opt-btn');
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// --- STEP 3: UI & PAYMENT CALCULATION ---
function updateUI() {
    // UPDATED: Added .toFixed(2) for consistent currency formatting (e.g., 5.00)
    document.getElementById('display-price').innerText = scanPrice.toFixed(2);
    document.getElementById('user-balance').innerText = insertedBalance.toFixed(2);

    const btn = document.getElementById('start-scan-btn');
    const remaining = scanPrice - insertedBalance;

    if (remaining <= 0) {
        btn.disabled = false;
        btn.innerText = "Start Scanning";
        btn.style.backgroundColor = "#28a745"; // Success Green
        btn.style.color = "white";
    } else {
        btn.disabled = true;
        // UPDATED: Formatting for the "Remaining" text
        btn.innerText = `Add ₱${remaining.toFixed(2)}`;
        btn.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
    }
}

// --- STEP 4: SCAN SEQUENCE ---
function runScanSequence() {
    const display = document.getElementById('scanner-display');
    const text = document.getElementById('status-text');

    // Basic safety check for balance
    if (insertedBalance < scanPrice) {
        alert("❌ Insufficient balance!");
        return;
    }

    text.innerText = `Scanning to ${format.toUpperCase()}...`;
    display.style.background = "#ffa500"; // Processing color (Orange)

    setTimeout(() => {
        display.style.background = "#28a745"; // Success color (Green)
        text.innerText = "Scan Complete!";
        alert(`✅ File saved successfully to ${target.toUpperCase()} as ${format.toUpperCase()}`);
        
        insertedBalance -= scanPrice; // Deduct payment
        updateUI();
    }, 3000);
}

// --- STEP 5: HARDWARE SIMULATOR ---
function insertCoin(amount) {
    insertedBalance += amount;
    updateUI();
}