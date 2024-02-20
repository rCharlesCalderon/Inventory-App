var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const { Schema } = mongoose;
const {ObjectId} = require("mongodb");
const itemSchema = require("../controller/itemSchema.js")
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

mongoose.connect("mongodb+srv://Rubcal123:Rubcal123@inventory.smc01ik.mongodb.net/?retryWrites=true&w=majority");
const db = mongoose.connection.useDb("Categories")

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});


//Lists Categories
router.get("/categories", async function (req, res) {
  const collectionData = await db.listCollections();

  res.render("categories", { collections: collectionData});
});

//Route to Create form page
router.get("/categories/create", async function (req, res) {
  res.render("categoriesCreate");
});

//Make collection in database from form
router.post("/createCategories", async function (req, res) {
  const categoryName = req.body.name;
  const categoryData = await db.listCollections();
  let findData = categoryData.find((name) => name.name === categoryName);
  if(!findData){
   await db.createCollection(categoryName);
  }
  res.redirect(`/categories/${categoryName}`)
});




//List all documents of a collection
router.get("/categories/:id", async function (req, res) {
  let id = req.params.id;
  const categoryData = await db.collection(id).find().toArray();
  res.render("category", { categoryData, collection: id });
});

router.post("/deleteCategory",async function(req,res){
const collectionName = req.query.collection;
await db.dropCollection(collectionName)
res.redirect("/")
})



//Render Category Name Change form
router.get("/updateCategory",async function(req,res){
const collectionName = req.query.collection;
  res.render("updateCategory",{collectionName});
});


//Change Category/Collection Name
router.post("/updateCategoryName", async function (req, res) {
  const collectionName = req.query.collectionName;
  let test = req.body.updateCategoryInput;
  await db.collection(collectionName).rename(test)
  res.redirect('/')
});







//Lists all items in Items tab
router.get("/items", async function(req,res){
  const itemsData = await db.listCollections()
  let documentData = []
  for(let i = 0; i < itemsData.length; i++){
    let documents = await db.collection(itemsData[i].name).find({}).toArray()
    documentData.push(...documents)
  }
  res.render("items",{documentData})
})

//Display an Item
router.get("/item/:collection/:id",async function (req, res) {
  const collection = req.params.collection
  const id = req.params.id
  const categoryData = await db.collection(collection).findOne({_id:new ObjectId(id)})
  console.log(categoryData)
  res.render("item", { categoryData, id,collection});
})
//Delete an Document/Item
router.post('/deleteItem',async function(req,res){
const documentId = req.query.id;
const collectionName = req.query.collection;
  await db.collection(collectionName).deleteOne({_id:new ObjectId(documentId)})
  res.redirect(`/categories/${collectionName}`)
})

//Create Item/Document for a collection
router.get('/items/create',async function(req,res){
  //passing in categories for dropdown menu
  const categories = await db.listCollections()
  res.render("createItem",{categories})
})
//Store item in MongoDB
router.post("/createItem", upload.single('itemImage'),async function(req,res){
 const newItem = db.model(req.body.categoryNames, itemSchema,req.body.categoryNames);
 const newItemInstance = new newItem({
   name: req.body.itemName,
   description: req.body.itemDescription,
   category: req.body.categoryNames,
   image: req.file ? req.file.filename : '',
   price: req.body.price,
   stock: req.body.stock,
 });
 await newItemInstance.save();
  res.redirect(`/categories/${req.body.categoryNames}`);
});

//Update document
router.get("/updateItem/:collection/:id", async function (req, res) {
 const collection = req.params.collection;
 const id = req.params.id;

 let data = await db.collection(collection).find({_id: new ObjectId(id)}).toArray()
 const collectionList = await db.listCollections()
 res.render("updateItem",{data,collectionList});
});

router.post("/update", async function (req, res) {
  const documentId = req.query.id;
  const collectionName = req.query.collection;
  const filter = { _id: new ObjectId(documentId) };
   const updateDoc = {
   $set: {
     name: req.body.itemName,
     description: req.body.itemDescription,
     price: req.body.price,
     stock: req.body.stock,
    }
   };
  
 

 
  await db.collection(collectionName).updateOne(filter, updateDoc)
   res.redirect(`/item/${collectionName}/${documentId}`);
});


module.exports = router;
