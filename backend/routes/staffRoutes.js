const express = require('express');
const { registerStaff } = require('../functions/registerStaff');
const { getStaffs } = require('../functions/getStaffs');
const { updateStaff } = require('../functions/update/updateStaff');
const { loginStaff } = require('../functions/loginStaff');
const {getStaffDetails} = require('../functions/guest/getStaffDetails');
const {updateStaffDetails} = require ('../functions/update/updateStaffDetails');
const {updateStaffProfile} =require('../functions/update/updateStaffProfile');
const { validatePassword } = require('../functions/update/validatePassword');
const {updateStaffPhoto} = require('../functions/update/updateStaffPhoto');

const router = express.Router();

// Route for staff registration
router.post('/registerStaff', registerStaff);

// Route to get list of all staff
router.get('/getStaffs', getStaffs);

// Route to update staff details by ID
router.put('/updateStaff/:staff_id', updateStaff);

// Route to update staff details by ID
router.put('/updateStaffDetails', updateStaffDetails);

// Route for staff login
router.post('/loginStaff', loginStaff);

router.get('/getStaffDetails', getStaffDetails);

router.put('/updateStaffProfile/:staff_id', updateStaffProfile);

router.post('/validatePassword', validatePassword);

router.put('/updateStaffPhoto', updateStaffPhoto);

module.exports = router;
