const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema({
    name: String,
    village: String,
    acres: Number,
    lat: Number,
    lng: Number,
    caneType: String,
    plantDate: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Farmer", farmerSchema);