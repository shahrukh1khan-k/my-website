
"use strict";

/* =========================================
   CART ANALYZER - IMPROVED JAVASCRIPT
========================================= */

let carts = [];

const STORAGE_KEY = "cartSessions";

const sampleCarts = [
    {
        id: "C101",
        customer: "Ali Raza",
        value: 120,
        items: 3,
        status: "Abandoned",
        reason: "High Shipping Costs",
        date: "2026-10-20"
    },
    {
        id: "C102",
        customer: "Farooq Ahmed",
        value: 85.50,
        items: 2,
        status: "Completed",
        reason: "N/A",
        date: "2026-10-21"
    },
    {
        id: "C103",
        customer: "Usman Tariq",
        value: 240,
        items: 5,
        status: "Abandoned",
        reason: "Payment Gateway Failure",
        date: "2026-10-22"
    },
    {
        id: "C104",
        customer: "Steve Smith",
        value: 65,
        items: 1,
        status: "Recovered",
        reason: "High Shipping Costs",
        date: "2026-10-23"
    },
    {
        id: "C105",
        customer: "Wasim Akram",
        value: 150,
        items: 4,
        status: "Abandoned",
        reason: "Complicated Checkout",
        date: "2026-10-24"
    }
];

const $ = (id) => document.getElementById(id);

const cartForm = $("cartForm");
const statusSelect = $("sessionStatus");
const reasonGroup = $("reasonGroup");
const filterSelect = $("filterStatus");
const cartTableBody = $("cartTableBody");
const emptyMessage = $("emptyMessage");
const resetDemoBtn = $("resetDemoBtn");
const clearAllBtn = $("clearAllBtn");

let storageAvailable = true;

/* =========================================
   1. INITIALIZE APPLICATION
========================================= */

function initApp() {
    loadFromStorage();
    setupEventListeners();
    updateReasonVisibility();
    updateUI();
}

/* =========================================
   2. LOAD AND SAVE DATA
========================================= */

function loadFromStorage() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);

        if (storedData === null) {
            carts = sampleCarts.map(cart => ({ ...cart }));
            saveToStorage();
            return;
        }

        const parsedData = JSON.parse(storedData);

        if (!Array.isArray(parsedData)) {
            throw new Error("Invalid saved cart data.");
        }

        carts = parsedData.filter(cart =>
            cart &&
            typeof cart.id === "string" &&
            typeof cart.customer === "string" &&
            Number.isFinite(Number(cart.value)) &&
            Number(cart.value) > 0 &&
            Number.isInteger(Number(cart.items)) &&
            Number(cart.items) > 0 &&
            ["Abandoned", "Completed", "Recovered"].includes(cart.status)
        ).map(cart => ({
            ...cart,
            value: Number(cart.value),
            items: Number(cart.items),
            reason: typeof cart.reason === "string" ? cart.reason : "N/A",
            date: typeof cart.date === "string" ? cart.date : getToday()
        }));

    } catch (error) {
        console.error("Could not load saved cart data:", error);
        carts = sampleCarts.map(cart => ({ ...cart }));
        storageAvailable = false;
    }
}

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(carts));
        storageAvailable = true;
    } catch (error) {
        storageAvailable = false;
        console.error("Could not save cart data:", error);
    }
}

function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function generateCartId() {
    let id;

    do {
        id = "C" + Math.floor(1000 + Math.random() * 9000);
    } while (carts.some(cart => cart.id === id));

    return id;
}

/* =========================================
   3. EVENT LISTENERS
========================================= */

function setupEventListeners() {
    statusSelect.addEventListener("change", updateReasonVisibility);

    cartForm.addEventListener("submit", handleFormSubmit);

    filterSelect.addEventListener("change", renderTable);

    resetDemoBtn.addEventListener("click", () => {
        if (confirm("Load sample data? Your current cart records will be replaced.")) {
            carts = sampleCarts.map(cart => ({ ...cart }));
            saveToStorage();
            clearErrors();
            updateUI();
        }
    });

    clearAllBtn.addEventListener("click", () => {
        if (carts.length === 0) {
            alert("There are no records to clear.");
            return;
        }

        if (confirm("Are you sure you want to delete all cart records?")) {
            carts = [];
            saveToStorage();
            updateUI();
        }
    });
}

function updateReasonVisibility() {
    const isCompleted = statusSelect.value === "Completed";

    reasonGroup.style.display = isCompleted ? "none" : "block";
}

/* =========================================
   4. FORM VALIDATION
========================================= */

function clearErrors() {
    $("nameError").textContent = "";
    $("valueError").textContent = "";
    $("itemsError").textContent = "";
}

function handleFormSubmit(event) {
    event.preventDefault();
    clearErrors();

    const customerName = $("customerName").value.trim();
    const cartValue = Number($("cartValue").value);
    const itemCount = Number($("itemCount").value);
    const status = statusSelect.value;

    const reason = status === "Completed"
        ? "N/A"
        : $("abandonReason").value;

    let isValid = true;

    if (customerName.length < 2) {
        $("nameError").textContent =
            "Please enter a name with at least 2 characters.";
        isValid = false;
    } else if (customerName.length > 100) {
        $("nameError").textContent =
            "Customer name must be under 100 characters.";
        isValid = false;
    }

    if (
        $("cartValue").value.trim() === "" ||
        !Number.isFinite(cartValue) ||
        cartValue <= 0
    ) {
        $("valueError").textContent =
            "Enter a valid cart value greater than zero.";
        isValid = false;
    } else if (cartValue > 1000000000) {
        $("valueError").textContent =
            "Cart value is too large.";
        isValid = false;
    }

    if (
        $("itemCount").value.trim() === "" ||
        !Number.isInteger(itemCount) ||
        itemCount < 1
    ) {
        $("itemsError").textContent =
            "Enter a whole number of at least 1.";
        isValid = false;
    }

    if (!isValid) return;

    const newCart = {
        id: generateCartId(),
        customer: customerName,
        value: Math.round(cartValue * 100) / 100,
        items: itemCount,
        status: status,
        reason: reason,
        date: getToday()
    };

    carts.unshift(newCart);
    saveToStorage();

    cartForm.reset();
    clearErrors();
    updateReasonVisibility();

    filterSelect.value = "All";
    updateUI();
}

/* =========================================
   5. CALCULATE DASHBOARD METRICS
========================================= */

function calculateMetrics() {
    const total = carts.length;

    const abandoned = carts.filter(
        cart => cart.status === "Abandoned"
    );

    const recovered = carts.filter(
        cart => cart.status === "Recovered"
    );

    const completed = carts.filter(
        cart => cart.status === "Completed"
    );

    const abandonedCount = abandoned.length;
    const recoveredCount = recovered.length;

    const lostRevenue = abandoned.reduce(
        (sum, cart) => sum + Number(cart.value), 0
    );

    const recoveredRevenue = recovered.reduce(
        (sum, cart) => sum + Number(cart.value), 0
    );

    const abandonmentRate = total > 0
        ? (abandonedCount / total) * 100
        : 0;

    // Based on currently recorded abandoned and recovered carts.
    const eligibleCarts = abandonedCount + recoveredCount;

    const recoveryRate = eligibleCarts > 0
        ? (recoveredCount / eligibleCarts) * 100
        : 0;

    const reasonsCount = {};

    abandoned.forEach(cart => {
        const reason = cart.reason || "Not specified";

        reasonsCount[reason] = (reasonsCount[reason] || 0) + 1;
    });

    return {
        total,
        abandonedCount,
        recoveredCount,
        completedCount: completed.length,
        lostRevenue,
        recoveredRevenue,
        abandonmentRate,
        recoveryRate,
        reasonsCount
    };
}

/* =========================================
   6. FORMAT MONEY AND RENDER DASHBOARD
========================================= */

function formatMoney(amount) {
    return "$" + Number(amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function renderDashboard() {
    const metrics = calculateMetrics();

    $("totalSessions").textContent = metrics.total;

    $("abandonmentRate").textContent =
        metrics.abandonmentRate.toFixed(1) + "%";

    $("abandonedCountText").textContent =
        `${metrics.abandonedCount} carts dropped`;

    $("lostRevenue").textContent =
        formatMoney(metrics.lostRevenue);

    $("recoveryRate").textContent =
        metrics.recoveryRate.toFixed(1) + "%";

    $("recoveredRevenueText").textContent =
        `${formatMoney(metrics.recoveredRevenue)} recovered`;

    renderReasons(metrics.reasonsCount);
}

/* =========================================
   7. RENDER ABANDONMENT REASONS
========================================= */

function renderReasons(reasonsCount) {
    const container = $("reasonsBreakdown");
    container.replaceChildren();

    const reasonsArray = Object.entries(reasonsCount)
        .sort((a, b) => b[1] - a[1]);

    if (reasonsArray.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-insight";

        const icon = document.createElement("span");
        icon.textContent = "📈";

        const message = document.createElement("p");
        message.textContent =
            "No abandoned cart data available. Add or load sample records to see insights.";

        empty.append(icon, message);
        container.appendChild(empty);
        return;
    }

    const totalAbandoned = reasonsArray.reduce(
        (sum, entry) => sum + entry[1], 0
    );

    reasonsArray.forEach(([reason, count]) => {
        const percentage = Math.round(
            (count / totalAbandoned) * 100
        );

        const item = document.createElement("div");
        item.className = "reason-item";

        const header = document.createElement("div");
        header.className = "reason-header";

        const label = document.createElement("span");
        label.textContent = `${reason} (${count})`;

        const percent = document.createElement("span");
        percent.textContent = `${percentage}%`;

        header.append(label, percent);

        const track = document.createElement("div");
        track.className = "progress-track";

        const fill = document.createElement("div");
        fill.className = "progress-fill";
        fill.style.width = `${percentage}%`;

        track.appendChild(fill);
        item.append(header, track);
        container.appendChild(item);
    });
}

/* =========================================
   8. RENDER SESSION HISTORY TABLE
========================================= */

function renderTable() {
    const filter = filterSelect.value;
    cartTableBody.replaceChildren();

    const filteredCarts = carts.filter(cart =>
        filter === "All" || cart.status === filter
    );

    emptyMessage.style.display =
        filteredCarts.length === 0 ? "block" : "none";

    filteredCarts.forEach(cart => {
        const row = document.createElement("tr");

        addCell(row, cart.date);
        addCell(row, cart.customer, true);
        addCell(row, String(cart.items));
        addCell(row, formatMoney(cart.value));

        // Status badge
        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = "badge";

        if (cart.status === "Completed") {
            badge.classList.add("badge-completed");
        } else if (cart.status === "Recovered") {
            badge.classList.add("badge-recovered");
        } else {
            badge.classList.add("badge-abandoned");
        }

        badge.textContent = cart.status;
        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        addCell(row, cart.reason || "N/A");

        // Actions
        const actionsCell = document.createElement("td");

        if (cart.status === "Abandoned") {
            const recoverButton = document.createElement("button");

            recoverButton.type = "button";
            recoverButton.className = "action-btn action-recover";
            recoverButton.textContent = "Mark Recovered";

            recoverButton.addEventListener("click", () => {
                markAsRecovered(cart.id);
            });

            actionsCell.appendChild(recoverButton);
        }

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "action-btn action-delete";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteCart(cart.id);
        });

        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);

        cartTableBody.appendChild(row);
    });
}

function addCell(row, value, bold = false) {
    const cell = document.createElement("td");

    // textContent prevents user-entered text from being interpreted as HTML.
    if (bold) {
        const strong = document.createElement("strong");
        strong.textContent = value;
        cell.appendChild(strong);
    } else {
        cell.textContent = value;
    }

    row.appendChild(cell);
}

/* =========================================
   9. RECOVER AND DELETE CARTS
========================================= */

function markAsRecovered(id) {
    const cart = carts.find(item => item.id === id);

    if (!cart || cart.status !== "Abandoned") return;

    cart.status = "Recovered";

    saveToStorage();
    updateUI();
}

function deleteCart(id) {
    const exists = carts.some(cart => cart.id === id);

    if (!exists) return;

    carts = carts.filter(cart => cart.id !== id);

    saveToStorage();
    updateUI();
}

/* =========================================
   10. UPDATE THE COMPLETE INTERFACE
========================================= */

function updateUI() {
    renderDashboard();
    renderTable();

    if (!storageAvailable) {
        console.warn(
            "Local storage is unavailable. Changes may not persist after reload."
        );
    }
}

/* =========================================
   START APPLICATION
========================================= */

document.addEventListener("DOMContentLoaded", initApp);
