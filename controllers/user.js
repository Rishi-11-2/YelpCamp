const User=require('../models/user');
module.exports.renderRegister=(req,res)=>{
    res.render('./users/register');
}
module.exports.register=async(req,res,next)=>{
    try{
        const{email ,username,password}=req.body;
     const user=new User({email,username});// saving the user but not saving the password with it
     const registerUser=  await User.register(user,password);// saving the user with a hash password using 'passport-local-mongoose' package
     req.login(registerUser,err=>{// req.login is a passport method
         if(err)return next();
         req.flash('success','WELCOME TO YELP CAMP');
     res.redirect('/campgrounds');
     })
    }catch(e)
    {
        req.flash('error',e.message);
        res.redirect('/register');
    }
     
}

module.exports.renderLogin=(req,res)=>{
    res.render('./users/login');
}
module.exports.login=(req,res)=>{
    req.flash('success','Welcome Back');
    const redirectUrl=req.session.returnTo||'/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
    
    }

    module.exports.logout=(req,res)=>{
        req.logout();
        req.flash('success','succesfully logged out');
        res.redirect('/campgrounds');
    }