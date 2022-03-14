const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const ImagesSchema = new Schema(
    {
        url: String,
        filename: String,
    }
)
ImagesSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})
const options = { toJSON: { virtuals: true } };
const campGroundSchema = new Schema({
    title: String,
    images: [ImagesSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, options);

campGroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`;
})// we are including properties.popUpMarkUp beacuse in map box everything is under properties so to access
// it in cluster maps every properties is under 'properties'
// we are converting  it into JSON so for virtuals to be a part of mongoose document 
// 


campGroundSchema.post('findOneAndDelete', async (doc) => {//  a mongoose middleware which will be trigerred if findByIdAndDelete is used to delete a campground
    if (doc.reviews) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews// it will check whether id is there in doc.reviews
            }
        })
    }

})
module.exports = mongoose.model('Campground', campGroundSchema); 