const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');// a sanitize HTML package

//syntax for joi validation so that the input does not include html
const extension = (joi) => ({
   type: 'string',
   base: joi.string(),
   messages: {
      'string.escapeHTML': '{{#label}} must not include HTML!'
   },
   rules: {
      escapeHTML: {
         validate(value, helpers) {
            const clean = sanitizeHtml(value, {
               allowedTags: [],
               allowedAttributes: {},
            });
            if (clean !== value) return helpers.error('string.escapeHTML', { value })
            return clean;
         }
      }
   }
});

const Joi = BaseJoi.extend(extension)//to include extension which sanitises HTML
module.exports.campgroundSchema = Joi.object({
   campground: Joi.object({
      title: Joi.string().required().escapeHTML(),
      price: Joi.number().required().min(0),
      // image:Joi.string().required(),
      location: Joi.string().required().escapeHTML(),
      description: Joi.string().required().escapeHTML(),
   }).required(),
   deleteImages: Joi.array()
})// JOI SCHEMA FOR VALIDATING DATA ENTERED BY THE USER. it is different from mongoose schema

module.exports.reviewSchema = Joi.object({
   review: Joi.object({
      rating: Joi.number().required().min(1).max(5),
      body: Joi.string().required().escapeHTML()
   }).required()
})