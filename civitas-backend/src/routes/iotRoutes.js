const express = require('express');
const router = express.Router();
const { createComplaintFromSensor } = require('../components/controllers/iotController');
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === process.env.IOT_API_KEY) {
        return next(); 
    }
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid API Key' });
};
router.post('/report_bin_status', apiKeyAuth, createComplaintFromSensor);

module.exports = router;