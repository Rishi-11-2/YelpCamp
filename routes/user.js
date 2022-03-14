const { Router } = require('express');
const passport=require('passport');
const express=require('express');
const router=express.Router();
const catchAsync=require('../utils/catchAsync');
const User=require('../models/user');

const users=require('../controllers/user')
router.route('/register')// a generic routes for get , post ,put, delete request to '/register'
.get(users.renderRegister)
.post( catchAsync(users.register))

//authenticating with 'passport' authenticatin
router.route('/login')
.get(users.renderLogin)
.post(passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.login)

router.get('/logout',users.logout)
module.exports=router;