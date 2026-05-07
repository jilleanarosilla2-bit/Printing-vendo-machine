/* js/print.js */

// --- STEP 1: INITIAL STATE & PRICES ---
let bwPrice = 0;
let colorPrice = 0;
let currentRate = 0; 
let copies = 1;
let insertedBalance = 0;

// NEW: Firebase Live Listener
// This replaces localStorage and updates your variables automatically
db.collection("settings").doc("pricing").onSnapshot((doc) => {
    if (doc.exists) {
        const data = doc.data();
        
        // Update the global variables
        bwPrice = parseFloat(data.printBW) || 0;
        colorPrice = parseFloat(data.printColor) || 0;

        // FIX: Only set currentRate if it's currently 0 (first load)
        // This prevents the price from resetting while the user is choosing options
        if (currentRate === 0) {
            currentRate = bwPrice;
        }

        if (typeof calculateTotal === "function") {
            calculateTotal();
        }
        
        console.log("Cloud Sync Success:", bwPrice, colorPrice);
    }
});

// Run initial calculation when the page loads
window.onload = () => {
    // Safety check: ensure currentRate is updated if Admin default is different
    currentRate = bwPrice; 
    calculateTotal();
};


// --- STEP 2: FILE UPLOAD HANDLING ---
function displayFileName() {
    const fileInput = document.getElementById('fileInput');
    const fileNameDisplay = document.getElementById('file-name-display');
    const fileBanner = document.getElementById('file-banner');
    const uploadBox = document.querySelector('.upload-box');

    if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        
        fileNameDisplay.innerText = fileName;
        fileBanner.style.display = 'flex';
        
        uploadBox.style.borderColor = "#2b59a2";
        uploadBox.style.backgroundColor = "#f0f7ff";
    } else {
        fileBanner.style.display = 'none';
    }
}


// --- STEP 3: SELECTION BUTTONS ---
function setColor(type, btn) {

    // 1. UI: Toggle active class

    const btns = btn.parentElement.querySelectorAll('.opt-btn');

    btns.forEach(b => b.classList.remove('active'));

    btn.classList.add('active');



    // 2. LOGIC: Use the variables updated by Firebase (bwPrice and colorPrice)

    // We removed the localStorage lines because they were causing the 0 error

    currentRate = (type === 'bw') ? bwPrice : colorPrice;

    

    calculateTotal();

}
function setSize(btn) {
    const btns = btn.parentElement.querySelectorAll('.opt-btn');
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    console.log("Size selected:", btn.innerText);
}


// --- STEP 4: COUNTER & MATH ---
function updateCopies(val) {
    copies += val;
    if (copies < 1) copies = 1; 
    
    document.getElementById('copy-count').innerText = copies;
    calculateTotal();
}

function calculateTotal() {
    const total = currentRate * copies;
    // Format to 2 decimal places for currency consistency
    document.getElementById('total-price').innerText = total.toFixed(2);
    
    updatePaymentStatus(total);
}


// --- STEP 5: THE PAYMENT GATE ---
function updatePaymentStatus(total) {
    const printBtn = document.getElementById('print-button');
    const warningMsg = document.getElementById('warning-msg');
    const balanceDisp = document.getElementById('balance-amount');
    
    if (balanceDisp) balanceDisp.innerText = insertedBalance.toFixed(2);

    let remaining = total - insertedBalance;

    if (remaining <= 0) {
        printBtn.disabled = false;
        printBtn.innerText = "Start Printing Now";
        printBtn.style.backgroundColor = "#28a745"; 
        printBtn.style.cursor = "pointer";
        
        if (warningMsg) warningMsg.style.display = "none";
    } else {
        printBtn.disabled = true;
        printBtn.innerText = `Insert ₱${remaining.toFixed(2)} to Print`;
        printBtn.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
        printBtn.style.cursor = "not-allowed";
        
        if (warningMsg) {
            warningMsg.innerText = `⚠️ Please insert ₱${remaining.toFixed(2)} more to start.`;
            warningMsg.style.display = "block";
        }
    }
}


// --- STEP 6: TRIGGERING THE PRINTER ---
function processPayment() {
    const total = currentRate * copies;
    const fileInput = document.getElementById('fileInput');

    if (fileInput.files.length === 0) {
        alert("❌ Please upload a file first!");
        return;
    }

    if (insertedBalance < total) {
        alert("❌ Insufficient balance! Please add more coins.");
        return;
    }

    alert("✅ Payment Confirmed! Sending document to printer...");
}

// --- BONUS: HARDWARE SIMULATOR ---
function insertCoin(amount) {
    insertedBalance += amount;
    calculateTotal();
}