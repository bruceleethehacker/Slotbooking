const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/slotBookingDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Booking Schema
const bookingSchema = new mongoose.Schema({
    date: String,
    startTime: String,
    endTime: String
});

const Booking = mongoose.model("Booking", bookingSchema);

// API to Book Slot
app.post("/book", async (req, res) => {
    const { date, startTime, endTime } = req.body;

    try {
        // Check overlapping booking
        const existing = await Booking.findOne({
            date: date,
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });

        if (existing) {
            return res.status(400).json({ message: "Slot already booked!" });
        }

        const newBooking = new Booking({ date, startTime, endTime });
        await newBooking.save();

        res.json({ message: "Slot booked successfully!" });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
app.listen(5000, () => console.log("Server running on port 5000"));
