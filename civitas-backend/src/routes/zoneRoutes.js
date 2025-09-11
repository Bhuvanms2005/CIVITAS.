const express = require('express');
const { getZoneData } = require('../components/controllers/zoneController');
const router = express.Router();
router.get('/', getZoneData);

module.exports = router;