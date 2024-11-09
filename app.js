if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}
console.log(process.env.SECRET)
const express= require ('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')

const passport = require('passport');
const LocalStrategy = require('passport-local')
const User = require('./models/user')

const monogoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users')
const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews')

mongoose.connect('mongodb://localhost:27017/yelp-camp2',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
   
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,'connection errror:'));
db.once('open',()=>{
    console.log('Database connected');
});

const app = express();


app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));



app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))

app.use(monogoSanitize({
    replaceWith:'_'
}));

const sessionConfig = {
    secret:'thisshouldbeabettersecret!',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        // 1000 ms in a second , 60 second in a min , 60 min in a hr , 7 days in a week 
        maxAge : 1000*60*60*24*7,
    }
    
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
    // console.log(req.session)
    res.locals.currentUser = req.user;
   res.locals.success =  req.flash('success');
   res.locals.error =  req.flash('error');
   next();
})


app.get('/fakeUser',async(req,res)=>{
    const user = new User({email:'rahulbose@gmail.com',username:'rahul'})
    const newUser = await User.register(user,'chicken')
    res.send(newUser);
})

app.use('/',userRoutes)
app.use('/campgrounds',campgroundsRoutes)
app.use('/campgrounds/:id/reviews',reviewsRoutes)


app.get('/',(req,res)=>{
    res.render('home', { currentUser: req.user });
})





app.all(/(.*)/,(req,res,next)=>{
    // res.send("404!!!")
    next(new ExpressError('page not found',404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error',{err});
    // res.send('oh boy something went wrong');
})

app.listen('8080',()=>{
    console.log('http://localhost:8080');
})