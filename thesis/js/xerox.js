/* js/xerox.js */

// --- 1. INITIAL STATE ---
let xeroxBW = 0; 
let xeroxColor = 0;
let currentRate = 0; 
let copies = 1;
let insertedBalance = 0;
let isDocumentPlaced = false;

// --- 2. FIREBASE LIVE LISTENER ---
// This automatically pulls the prices you set in the Admin Panel
db.collection("settings").doc("pricing").onSnapshot((doc) => {
    if (doc.exists) {
        const data = doc.data();

        // Sync local variables with Firebase data
        xeroxBW = parseFloat(data.xeroxBW) || 0;
        xeroxColor = parseFloat(data.xeroxColor) || 0;

        // Set the initial rate (default to B&W) only on first load
        if (currentRate === 0) {
            currentRate = xeroxBW;
        }

        // Immediately refresh the total on the screen
        calculateTotal();
        console.log("Xerox Cloud Sync Success:", xeroxBW, xeroxColor);
    }
});

// --- 3. SELECTION LOGIC ---
function setColor(type, btn) {
    // UI: Toggle the blue 'active' color on buttons
    const btns = btn.parentElement.querySelectorAll('.opt-btn');
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // LOGIC: Use the live variables from Firebase
    currentRate = (type === 'bw') ? xeroxBW : xeroxColor;

    calculateTotal();
}

// Placeholder for size selection if you use it later
function setSize(btn) {
    const btns = btn.parentElement.querySelectorAll('.opt-btn');
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    console.log("Paper Size set to:", btn.innerText);
}

// --- 4. COUNTER & MATH ---
function updateCopies(val) {
    copies += val;
    if (copies < 1) copies = 1; 
    
    const countElement = document.getElementById('copy-count');
    if (countElement) countElement.innerText = copies;
    
    calculateTotal();
}

function calculateTotal() {
    const total = currentRate * copies;
    
    // Update the Price Display
    // We check for both possible IDs to prevent the 0 price bug
    const totalPriceElement = document.getElementById('total-price') || document.getElementById('total-cost');
    
    if (totalPriceElement) {
       totalPriceElement.innerText = total.toFixed(2);
    }
    
    // Update the Insert Money button and Warning message
    updatePaymentStatus(total);
}

// --- 5. PAYMENT & UI STATUS ---
function updatePaymentStatus(total) {
    const xeroxBtn = document.getElementById('xerox-button');
    const balanceDisp = document.getElementById('balance-amount');
    const warningMsg = document.getElementById('warning-msg');
    
    if (balanceDisp) balanceDisp.innerText = insertedBalance.toFixed(2);

    let remaining = total - insertedBalance;

    if (remaining <= 0) {
        // Condition met: Enough money
        if (xeroxBtn) {
            xeroxBtn.disabled = false;
            xeroxBtn.innerText = "Start Xerox Now";
            xeroxBtn.style.backgroundColor = "#28a745"; 
        }
        if (warningMsg) warningMsg.style.display = "none";
    } else {
        // Condition not met: Need more money
        if (xeroxBtn) {
            xeroxBtn.disabled = true;
            xeroxBtn.innerText = `Insert ₱${remaining.toFixed(2)} to Start`;
            xeroxBtn.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
        }
        if (warningMsg) {
            warningMsg.style.display = "block";
            warningMsg.innerText = `⚠️ Please insert ₱${remaining.toFixed(2)} more.`;
        }
    }
}

// --- 6. XEROX ACTIONS ---
function simulateScan() {
    const statusText = document.getElementById('scan-status');
    const scanBox = document.getElementById('scan-box');

    isDocumentPlaced = true;
    if (statusText) statusText.innerText = "✅ Document Ready";
    if (scanBox) {
        scanBox.style.borderColor = "#28a745";
        scanBox.style.backgroundColor = "#f0fff4";
    }
}

function startScanningProcess() {
    if (!isDocumentPlaced) {
        alert("❌ Please tap the document box to place your document on the scanner!");
        return;
    }

    alert("⚙️ Xerox in progress... Please wait.");
    
    setTimeout(() => {
        alert("✅ Xerox Completed Successfully!");
        window.location.href = "main.html";
    }, 3000);
}

// Manual trigger for hardware testing
function insertCoin(amount) {
    insertedBalance += amount;
    calculateTotal();
}