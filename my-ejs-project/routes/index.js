var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const { Schema } = mongoose;
const {ObjectId} = require("mongodb")

mongoose.connect(
  "mongodb+srv://Rubcal123:Rubcal123@inventory.smc01ik.mongodb.net/?retryWrites=true&w=majority"
);
/////HOLY FUCCCCCCCCCCCCCKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK
 const categorySchema = new Schema({
        name: String,
        description: String,
        category: String,
        stock: Number,
        url: String,
        price: Number,
      })

//NAVBAR
const navBar = {
  home: "Home",
  categories: "Categories",
  items: "Items",
};

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", navBar);
});


// GET Categories
//lists categories
router.get("/categories", async function (req, res) {
  const collectionData = await mongoose.connection
    .useDb("Categories")
    .listCollections();
    console.log(collectionData)
  res.render("categories", { navBar, collections: collectionData});
});
//Route to Create form page
router.get("/categories/create", async function (req, res) {
  res.render("categoriesCreate");
});
//Make collection in database from form
router.post("/createCategories", async function (req, res) {
  const categoryName = req.body.name;
  const categoryData = await mongoose.connection
    .useDb("Categories")
    .listCollections();
  let findData = categoryData.find((name) => name.name === categoryName);
  if(!findData){
    const category = await mongoose.connection.useDb("Categories").createCollection(categoryName);
     
       
  }

  res.redirect(`/categories/${categoryName}`)
});
//GET single category
//lists everything related to something like scifi
router.get("/categories/:id", async function (req, res) {
  let id = req.params.id;
  const categoryData = await mongoose.connection
    .useDb("Categories")
    .collection(id)
    .find()
    .toArray();
  //do some filtering for the id later and pass it
  res.render("category", { categoryData, collection: id });
});


//NOAH PROBLEM
router.get("/items", async function(req,res){
  const itemsData = await mongoose.connection.useDb("Categories").listCollections()
  console.log(itemsData)
  let documentData = []
  for(let i = 0; i < itemsData.length; i++){
    let documents = await (await mongoose.connection.useDb("Categories").collection(itemsData[i].name).find({}).toArray())
    
    documentData.push(...documents)
    console.log(documentData)
  }
  res.render("items",{documentData})
  
})
//GET ITEM OF CATEGORY
//Lists the item
//go through and find the obj, u have the item id but dont have the specific category id :(
router.get("/item/:collection/:id",async function (req, res) {
  const collection = req.params.collection
  const id = req.params.id
  const categoryData = await mongoose.connection.useDb("Categories").collection(collection).findOne({_id:new ObjectId(id)})
  function func1() {
    console.log("I am in the click handler 1!");
  }
  res.render("item", { categoryData, clickHandler: func1() });
})
//display items
router.get('/items/create',async function(req,res){
  const categories = await mongoose.connection.useDb('Categories').listCollections()
  console.log(categories)
  res.render("createItem",{categories})
})
router.post("/createItem",async function(req,res){
 
  await mongoose.connection.useDb("Categories").collection(req.body.categoryNames).insertOne({
    name:req.body.itemName,
    description:req.body.itemDescription,
    category:req.body.categoryNames,
    image:req.body.image,
    price:req.body.price,
    stock:req.body.stock
  })
  res.redirect(`/categories/${req.body.categoryNames}`);
});
module.exports = router;
