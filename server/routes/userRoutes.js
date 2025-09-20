const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const ratelimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const ratelimiter = ratelimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

const validateRegistration = [
    body('phone').isMobilePhone().withMessage('Invalid phone number'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('username').notEmpty().withMessage('Username is required')
];

router.post('/register', ratelimiter, validateRegistration, userController.register);
// router.post('/login', userController.login);

module.exports = router;
