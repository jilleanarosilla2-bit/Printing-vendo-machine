/* --- Global State --- */
// These variables act as the single source of truth for calculations
let currentRates = {
    pBW: 0,
    pColor: 0,
    xBW: 0,
    xColor: 0,
    sFlat: 0
};

/* --- Firebase Sync Logic --- */
function syncPricesFromCloud() {
    const pricingRef = window.dbRef(window.db, 'pricing');

    // Listen for real-time updates from the Singapore database
    window.dbOnValue(pricingRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            console.log("Cloud Sync Triggered:", data);

            // 1. Update Global State (Numbers)
            currentRates.pBW = parseFloat(data.pBW) || 0;
            currentRates.pColor = parseFloat(data.pColor) || 0;
            currentRates.xBW = parseFloat(data.xBW) || 0;
            currentRates.xColor = parseFloat(data.xColor) || 0;
            currentRates.sFlat = parseFloat(data.sFlat) || 0;

            // 2. Update Main Menu Cards (Visuals for image_ca8dba.png)
            updateElementText('price-pBW', `₱${data.pBW}`);
            updateElementText('price-pColor', `₱${data.pColor}`);
            updateElementText('price-xBW', `₱${data.xBW}`);
            updateElementText('price-xColor', `₱${data.xColor}`);
            updateElementText('price-sFlat', `₱${data.sFlat}`);

            // 3. Force Recalculate (Fix for image_ca8d42.png)
            // This ensures that if the user is already on the print screen,
            // the total cost updates instantly when you save in admin.
            updateTotalCost();
        }
    });
}

/* --- Calculation Logic --- */
function updateTotalCost() {
    // Check if we are on a page that requires calculation
    const copyElement = document.getElementById('copy-count');
    const totalDisplay = document.getElementById('total-cost-display');
    if (!copyElement || !totalDisplay) return;

    // Get current UI state
    const copies = parseInt(copyElement.innerText) || 1;
    const isColor = document.getElementById('btn-color')?.classList.contains('active');

    // Perform math using the Cloud-Synced Global State
    const rate = isColor ? currentRates.pColor : currentRates.pBW;
    const total = rate * copies;

    // Update the UI
    totalDisplay.innerText = `₱${total.toFixed(2)}`;
    
    // Update auxiliary messages
    const msg = document.getElementById('payment-needed-msg');
    const btn = document.getElementById('insert-btn-text');
    if (msg) msg.innerText = `Please insert ₱${total.toFixed(2)} more to start.`;
    if (btn) btn.innerText = `Insert ₱${total.toFixed(2)} to Print`;
}

/* --- UI Helper Functions --- */
function updateElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

function changeCopies(amount) {
    const el = document.getElementById('copy-count');
    if (!el) return;
    let count = parseInt(el.innerText) || 1;
    count = Math.max(1, count + amount); // Prevent less than 1 copy
    el.innerText = count;
    updateTotalCost();
}

function setActiveColor(type) {
    const bwBtn = document.getElementById('btn-bw');
    const colorBtn = document.getElementById('btn-color');
    
    if (type === 'color') {
        colorBtn?.classList.add('active');
        bwBtn?.classList.remove('active');
    } else {
        bwBtn?.classList.add('active');
        colorBtn?.classList.remove('active');
    }
    updateTotalCost();
}

/* --- Initialization --- */
window.onload = () => {
    syncPricesFromCloud();

    // Attach Event Listeners for Step 2 and Step 4
    document.getElementById('btn-plus')?.addEventListener('click', () => changeCopies(1));
    document.getElementById('btn-minus')?.addEventListener('click', () => changeCopies(-1));
    document.getElementById('btn-bw')?.addEventListener('click', () => setActiveColor('bw'));
    document.getElementById('btn-color')?.addEventListener('click', () => setActiveColor('color'));
};