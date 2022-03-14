const Campground = require('../models/campground');//
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const Geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');
module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });

}
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};
module.exports.createCampground = async (req, res, next) => {
    const geoData = await Geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()// forward Geocode is a mapbox method on Geocoding services

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;// mapbox converts the name of location to latitutde and logitude
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'SUCCESFULLY MADE A NEW CAMPGROUND');
    res.redirect(`/campgrounds/${campground._id}`);

};
module.exports.showCampground = async (req, res) => {
    const campground = await (Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author',
            }
        })// populating thr author of reviews
        .populate('author'));
    if (!campground) {
        req.flash('error', 'cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground })
}
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...images);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);//deleting from cloudinary
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })//deleting images from mongoDB database 
    }

    req.flash('success', 'Succesfully updated Campground');
    res.redirect(`/campgrounds/${campground._id}`);
};
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'YOU DO NOT HAVE PERMISSIONS TO DO THAT');
        return res.redirect(`/campgrounds/${id}`);
    }
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'succesfully deleted campground')
    res.redirect('/campgrounds');
}