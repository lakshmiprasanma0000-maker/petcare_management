// =====================================
// LP PetCare - script.js
// =====================================

// Display success or error messages
function showMessage(elementId, text, success = true) {
    const message = document.getElementById(elementId);

    if (!message) {
        alert(text);
        return;
    }

    message.textContent = text;
    message.className = success ? "success" : "error";
    message.style.display = "block";
}

// Send data to the Node.js backend
async function sendData(url, data) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Something went wrong.");
    }

    return result;
}

// Register an owner
async function registerOwner(owner) {
    return sendData("/api/owners", owner);
}

// Register a pet
async function registerPet(pet) {
    return sendData("/api/pets", pet);
}

// Register an appointment
async function registerAppointment(appointment) {
    return sendData("/api/appointments", appointment);
}

// Load records from the backend and display them in a table
async function loadRecords(apiUrl, tableBodyId, columns) {
    const tableBody = document.getElementById(tableBodyId);

    if (!tableBody) return;

    tableBody.innerHTML =
        `<tr><td colspan="${columns.length}">Loading records...</td></tr>`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("Unable to load records.");
        }

        const result = await response.json();
        const records = Array.isArray(result) ? result : result.data;

        tableBody.replaceChildren();

        if (!Array.isArray(records) || records.length === 0) {
            tableBody.innerHTML =
                `<tr><td colspan="${columns.length}">No records found.</td></tr>`;
            return;
        }

        records.forEach(record => {
            const row = document.createElement("tr");

            columns.forEach(column => {
                const cell = document.createElement("td");
                const value = record[column];

                cell.textContent =
                    value === null || value === undefined
                        ? "-"
                        : String(value);

                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error(error);

        tableBody.innerHTML =
            `<tr><td colspan="${columns.length}">
                Unable to load records. Check whether the server is running.
            </td></tr>`;
    }
}

// Load owners table
function loadOwners() {
    loadRecords(
        "/api/owners",
        "ownersTableBody",
        ["owner_id", "name", "email", "phone", "address"]
    );
}

// Load pets table
function loadPets() {
    loadRecords(
        "/api/pets",
        "petsTableBody",
        ["pet_id", "owner_id", "pet_name", "species", "breed", "age"]
    );
}

// Load appointments table
function loadAppointments() {
    loadRecords(
        "/api/appointments",
        "appointmentsTableBody",
        [
            "appointment_id",
            "pet_id",
            "doctor_name",
            "appointment_date",
            "reason"
        ]
    );
}

// Load the relevant table when a page opens
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("ownersTableBody")) {
        loadOwners();
    }

    if (document.getElementById("petsTableBody")) {
        loadPets();
    }

    if (document.getElementById("appointmentsTableBody")) {
        loadAppointments();
    }
});