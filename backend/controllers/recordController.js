const Record = require("../models/Record");

// ➕ CREATE RECORD
const createRecord = async (req, res) => {
    try {
        const record = new Record(req.body);
        await record.save();

        res.status(201).json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📄 GET ALL RECORDS
const getRecords = async (req, res) => {
    try {
        const records = await Record.find();
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✏ UPDATE RECORD
const updateRecord = async (req, res) => {
    try {
        const record = await Record.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ❌ DELETE RECORD
const deleteRecord = async (req, res) => {
    try {
        await Record.findByIdAndDelete(req.params.id);
        res.json({ message: "Record deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ EXPORT ALL FUNCTIONS (IMPORTANT)
module.exports = {
    createRecord,
    getRecords,
    updateRecord,
    deleteRecord
};