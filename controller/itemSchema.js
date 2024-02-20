const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema({
  name: String,
  description: String,
  category: String,
  image: String,
  price: Number,
  stock: Number,
});

module.exports = itemSchema;
