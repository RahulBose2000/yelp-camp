if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}

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

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users')
const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews')
const helmet = require('helmet')
const MongoStore = require('connect-mongo');

// const dbURL = process.env.DB_URL;
const dbUrl = process.env.DB_URL||"mongodb://localhost:27017/yelp-camp2";
if (!dbUrl) {
    throw new Error("❌ DB_URL is missing! Set it in Render Environment Variables.");
}

mongoose.connect(dbUrl);

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

app.use(mongoSanitize({
    replaceWith: '_'
}));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: { secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret!' },
});

store.on("error",function(e){
    console.log('session store error',e);
})

const sessionConfig = {
    store,
    name:'session',
    secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret!',
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
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.tiles.mapbox.com/",
    // "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.mapbox.com/",
    // "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    // "https://api.mapbox.com/",
    // "https://a.tiles.mapbox.com/",
    // "https://b.tiles.mapbox.com/",
    // "https://events.mapbox.com/",
    "https://api.maptiler.com/", // add this
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dluoktxjj/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: [],
        },
    })
);


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

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 5050;
app.listen(port,()=>{
  console.log(`http://localhost:${port}`);
})
