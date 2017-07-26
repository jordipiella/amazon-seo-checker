const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const urlSchema = new Schema({
  url: String,
  title: String,
  bullets: [],
  images: [],
  imagesHigh: [],
  productRating: Number,
  numReviews: Number,
  description: String,
  fullfilled: Boolean

}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

var Url = mongoose.model("Url", urlSchema);
module.exports = Url;
