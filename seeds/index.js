
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers')

const Campground = require('../models/campground');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 500; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            // your user id dont delete id or a problem will be occur
            // i think most probably it is 'Biden'  
            author: '62275bbfc9764535aee49713',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed labore totam perferendis suscipit repudiandae amet quaerat quam rem numquam culpa quos eligendi assumenda fugiat facilis, quasi repellat aliquid? Placeat',
            price: price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dcerchxfc/image/upload/v1646912479/YelpCamp/qfb0aaypsg2ovap0980b.jpg',
                    filename: 'YelpCamp/qfb0aaypsg2ovap0980b',

                },
                {
                    url: 'https://res.cloudinary.com/dcerchxfc/image/upload/v1646912479/YelpCamp/kf87tyhclffjidpgyl3y.jpg',
                    filename: 'YelpCamp/kf87tyhclffjidpgyl3y',

                }
            ]


        })
        await camp.save();
    }

}

seedDB()
    .then(() => {
        mongoose.connection.close();// closes the mongoose connection
    })