const {campgroundSchema,reviewSchema}=require('./schemas');
const Campground=require('./models/campground');
const Review =require('./models/review');
const ExpressError=require('./utils/ExpressError');
module.exports.isLoggedIn=(req,res,next)=>{
   // console.log('REQ.USER:',req.user);
    if(!req.isAuthenticated())
    {
        req.session.returnTo=req.originalUrl;
        req.flash('error','you must be signed in!!');
       return   res.redirect('/login');
    }
    next();
}
module.exports.isAuthor=async(req,res,next)=>{
    const{ id }=req.params;
    const campground=await Campground.findById(id);
    if(!campground.author.equals(req.user._id))
    {
        req.flash('error','YOU DO HAVE PERMISSION TO ACCESS THIS CAMPGROUND');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
module.exports.validateCampground=(req,res,next)=>{
    const {error} =campgroundSchema.validate(req.body);// it will run validation against incoming req.body
    if(error)
    {
        const msg=error.details.map(el=>el.message).join(',')
        //throw new ExpressError('VALIDATION SCHEME FAILED,ENTER CORRECT DETAILS',400);
        throw new ExpressError(msg,404);
    }
    else
    {
        next();
    }
}
module.exports.validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error)
    {
        const msg=error.details.map(el=>el.message).join(',')
        //throw new ExpressError('VALIDATION SCHEME FAILED,ENTER CORRECT DETAILS',400);
        throw new ExpressError(msg,404);
    }
    else
    {
        next();
    }
}
module.exports.isReviewAuthor=async(req,res,next)=>{
    const{ id,reviewId }=req.params;
    const review=await Review.findById(reviewId);
    if(!review.author.equals(req.user._id))
    {
        req.flash('error','YOU DO HAVE PERMISSION TO DO THAT');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}