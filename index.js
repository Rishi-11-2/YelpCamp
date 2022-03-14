if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const secret = process.env.SECRET || 'secret';


//console.log(process.env.secret);
const express = require('express');


const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
//const Joi=require('joi');//dont need Joi anymore cause we are exporting from schemas.js
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const { title } = require('process');
const { campgroundSchema, reviewSchema } = require('./schemas');// we can write schemas.js also. it wont matter
const passport = require('passport');
const LocalStrategy = require('passport-local');
const localMongoose = require('passport-local-mongoose');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');

const helmet = require('helmet');
//mongodb://localhost:27017/yelp-camp
const dbUrl = process.env.DB_URL | 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
const session = require('express-session');
const MongoDBStore = require("connect-mongo");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
})
const app = express();
app.engine('ejs', ejsMate);// using ejs-mate a tool for creating boilerplate


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60,
})
store.on('error', function (e) {
    console.log("Session store", e);
})
const sessionConfig = {
    store,
    name: 'YoY@',//chnaging the name
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,// in milliseconds
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    })
);
//





app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(passport.initialize());
app.use(passport.session());// session should be use before 'passport-session'
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());//store the user in a session
passport.deserializeUser(User.deserializeUser());//store the user in a session
app.use((req, res, next) => {
    res.locals.currentUser = req.user;// it makes 'current user' available  in every template , it is available globally
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

const userRoutes = require('./routes/user');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

app.use('/campgrounds', campgroundRoutes);//connecting to campground routes
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('PAGE NOT FOUND', 404));
})
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "SOMETHING WENT WRONG";
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('SERVING ON PORT 3000');
})