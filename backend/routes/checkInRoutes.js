const express = require('express');
const { registerCheckIn } = require('../functions/registerCheckIn');
const { registerAdditionalItem } = require('../functions/frontDesk/resgisterAdditionalItem');
const router = express.Router();

router.post('/registerAdditionalItem', registerAdditionalItem);

router.post('/registerCheckIn', registerCheckIn);

module.exports = router;
