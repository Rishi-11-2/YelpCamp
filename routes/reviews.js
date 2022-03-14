const { Router } = require('express');
const Campground=require('../models/campground');
const Review=require('../models/review');
const express=require('express');
const catchAsync=require('../utils/catchAsync');
const ExpressError=require('../utils/ExpressError');
const router=express.Router({mergeParams:true});// so that we can receive id from the routes 
const { validateReview ,isLoggedIn,isReviewAuthor }=require('../middleware');

const reviews = require('../controllers/review');

router.post('/', isLoggedIn,validateReview,catchAsync(reviews.createReview));

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReview));

module.exports=router;