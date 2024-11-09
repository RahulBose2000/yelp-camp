
const mongoose = require('mongoose');
const cities = require('./cities');
const {places,descriptors}= require('./seedHelpers')
const Campground = require('../models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp2',{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,'connection errror:'));
db.once('open',()=>{
    console.log('Database connected');
});

const sample = (array) =>{
    return array[Math.floor(Math.random()*array.length)];
    
}

const seedDB = async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20) + 10;
        const camp = new Campground({
            author:`670ed9aa1393e02940fb3a10`,
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            // image:`https://picsum.photos/400?random=${Math.random()}`,
            description:`Parser is a deprecated option: useNewUrlParser has no effect since Node.js Driver version 4.0.0 and will be removed in the next major version `,
            price:price,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude,cities[random1000].latitude]
            },
            images:[
                {
                  url: 'https://res.cloudinary.com/dluoktxjj/image/upload/v1729789267/YelpCamp/fop4oi8g4srxqftnlhmf.jpg',
                  filename: 'YelpCamp/fop4oi8g4srxqftnlhmf',
                  
                },
                {
                  url: 'https://res.cloudinary.com/dluoktxjj/image/upload/v1729789276/YelpCamp/s2mtnjlufjicafmawyzu.jpg',
                  filename: 'YelpCamp/s2mtnjlufjicafmawyzu',
                  
                }
              ]
        })
        await camp.save();
    }
}


seedDB();