const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const dbConfig = {
    host: "localhost",
    user: "root",
    password: "googlemates",
    database: "petcare"
};

let db;

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Get all owners
app.get("/api/owners", async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT owner_id, name, email, phone, address FROM owners ORDER BY owner_id"
        );
        res.json(rows);
    } catch (err) {
        console.error("GET owners:", err.message);
        res.status(500).json({ message: err.message });
    }
});

// Register owner
app.post("/api/owners", async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;

        if (!name || !email || !phone || !address) {
            return res.status(400).json({
                message: "Please fill in all owner details."
            });
        }

        const [result] = await db.execute(
            "INSERT INTO owners (name, email, phone, address) VALUES (?, ?, ?, ?)",
            [name, email, phone, address]
        );

        res.status(201).json({
            message: "Owner registered successfully!",
            owner_id: result.insertId
        });
    } catch (err) {
        console.error("POST owners:", err.message);
        res.status(500).json({ message: err.message });
    }
});

// Get all pets
app.get("/api/pets", async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT pet_id, owner_id, pet_name, species, breed, age FROM pets ORDER BY pet_id"
        );
        res.json(rows);
    } catch (err) {
        console.error("GET pets:", err.message);
        res.status(500).json({ message: err.message });
    }
});

// Register pet
app.post("/api/pets", async (req, res) => {
    try {
        const { owner_id, pet_name, species, breed, age } = req.body;

        if (!owner_id || !pet_name || !species || !breed || age === "" || age == null) {
            return res.status(400).json({
                message: "Please fill in all pet details."
            });
        }

        const [result] = await db.execute(
            "INSERT INTO pets (owner_id, pet_name, species, breed, age) VALUES (?, ?, ?, ?, ?)",
            [owner_id, pet_name, species, breed, age]
        );

        res.status(201).json({
            message: "Pet registered successfully!",
            pet_id: result.insertId
        });
    } catch (err) {
        console.error("POST pets:", err.message);
        res.status(500).json({ message: err.message });
    }
});

// Get all appointments
app.get("/api/appointments", async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT appointment_id, pet_id, doctor_name,
                    DATE_FORMAT(appointment_date, '%Y-%m-%d') AS appointment_date,
                    reason, status
             FROM appointments
             ORDER BY appointment_id`
        );

        res.json(rows);
    } catch (err) {
        console.error("GET appointments:", err.message);
        res.status(500).json({ message: err.message });
    }
});

// Register appointment
app.post("/api/appointments", async (req, res) => {
    try {
        const { pet_id, doctor_name, appointment_date, reason } = req.body;

        if (!pet_id || !doctor_name || !appointment_date || !reason) {
            return res.status(400).json({
                message: "Please fill in the pet ID, doctor's name, date, and reason."
            });
        }

        const [result] = await db.execute(
            `INSERT INTO appointments
                (pet_id, doctor_name, appointment_date, reason, status)
             VALUES (?, ?, ?, ?, ?)`,
            [pet_id, doctor_name, appointment_date, reason, "Scheduled"]
        );

        res.status(201).json({
            message: "Appointment booked successfully!",
            appointment_id: result.insertId
        });
    } catch (err) {
        console.error("POST appointments:", err.message);
        res.status(500).json({
            message: "Appointment booking failed: " + err.message
        });
    }
});

// API route not found
app.use("/api", (req, res) => {
    res.status(404).json({ message: "API route not found." });
});

// Start server
async function startServer() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log("Connected to MySQL: petcare");

        app.listen(PORT, () => {
            console.log(`LP PetCare is running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Database connection failed:", err.message);
    }
}

startServer();