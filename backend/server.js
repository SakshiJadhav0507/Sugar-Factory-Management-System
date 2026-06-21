const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Farmer = require("./models/Farmer");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect DB
mongoose.connect("mongodb://127.0.0.1:27017/sugarfactory")
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log(err));

// ✅ USER MODEL
const User = mongoose.model("User", {
    username: String,
    password: String,
    role: String
});

// ----------------------
// 🌐 ROUTES START
// ----------------------

// Home check
app.get("/", (req, res) => {
    res.send("✅ Server is running");
});

// ----------------------
// 🔐 LOGIN (ONLY ONE)
// ----------------------
app.post("/addWorker", async(req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).send("Password required");
        }

        // 🔍 Find last worker
        const lastWorker = await User.find({ role: "worker" })
            .sort({ username: -1 })
            .limit(1);

        let newNumber = 1;

        if (lastWorker.length > 0) {
            const lastUsername = lastWorker[0].username; // GM-W005

            const match = lastUsername.match(/\d+/);
            if (match) {
                newNumber = parseInt(match[0]) + 1;
            }
        }

        // 🎯 Format → GM-W001
        const username = "GM-W" + String(newNumber).padStart(3, "0");

        const newWorker = new User({
            username,
            password,
            role: "worker"
        });

        await newWorker.save();

        res.send(`✅ Worker Created\nID: ${username}`);

    } catch (err) {
        console.log(err);
        res.status(500).send("Error adding worker");
    }
});

// ----------------------
// 👨‍🌾 FARMER ROUTES
// ----------------------

// Get all farmers
app.get("/getFarmers", async(req, res) => {
    try {
        const farmers = await Farmer.find();
        res.json(farmers);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error fetching farmers");
    }
});

// Delete farmer
app.delete("/deleteFarmer/:id", async(req, res) => {
    try {
        await Farmer.findByIdAndDelete(req.params.id);
        res.send("Farmer deleted successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error deleting farmer");
    }
});

// Update farmer
app.put("/updateFarmer/:id", async(req, res) => {
    try {
        await Farmer.findByIdAndUpdate(req.params.id, req.body);
        res.send("Farmer updated successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error updating farmer");
    }
});

// ----------------------
// 👷 WORKER MANAGEMENT
// ----------------------

// Get all workers
app.get("/workers", async(req, res) => {
    try {
        const workers = await User.find({ role: "worker" });
        res.json(workers);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching workers");
    }
});

// Add worker
app.post("/addWorker", async(req, res) => {
    try {
        const { username, password } = req.body;

        const existing = await User.findOne({ username });

        if (existing) {
            return res.status(400).send("❌ Worker already exists");
        }

        const newWorker = new User({
            username,
            password,
            role: "worker"
        });

        await newWorker.save();

        res.send("✅ Worker added successfully");

    } catch (err) {
        console.log(err);
        res.status(500).send("Error adding worker");
    }
});

app.delete("/deleteWorker/:id", async(req, res) => {
    try {
        const worker = await User.findByIdAndDelete(req.params.id);

        if (!worker) {
            return res.status(404).send("Worker not found");
        }

        res.send("✅ Worker deleted successfully");

    } catch (err) {
        console.log(err);
        res.status(500).send("Error deleting worker");
    }
});
app.post("/addFarmer", async(req, res) => {
    try {
        const farmer = new Farmer(req.body);

        await farmer.save();

        res.send("✅ Farmer added successfully");

    } catch (err) {
        console.log(err);
        res.status(500).send("Error adding farmer");
    }
});

// ----------------------
// 🚀 START SERVER
// ----------------------
app.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
});

// LOGIN
app.post("/login", async(req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({
            username,
            password
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid Username or Password"
            });
        }

        res.json({
            username: user.username,
            role: user.role
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
});