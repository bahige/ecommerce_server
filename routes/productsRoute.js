const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");

const {isAuth, isAdmin} = require('../middleware/authentication');

////////////////////////////////////////////// For image uploading: ////////////////////////////////////////////// 


const multer = require("multer");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
    // cb(null, '../frontend/public/images');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});


////////////////////////////////////////////// GET Request ////////////////////////////////////////////// 


// router.get("/", async (req, res) => {
//   const category = req.query.category ? { category: req.query.category } : {};
//   const searchKeyword = req.query.searchKeyword
//     ? {
//         name: {
//           $regex: req.query.searchKeyword,
//           $options: "i",
//         },
//       }
//     : {};
//   const sortOrder = req.query.sortOrder
//     ? req.query.sortOrder === "lowest"
//       ? { price: 1 }
//       : { price: -1 }
//     : { _id: -1 };
  
//   try{
//   const products = await Product.find({ ...category, ...searchKeyword }).sort(
//     sortOrder
//   );
//   res.send(products);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

//////////////////////////////////////////Get With Pagination////////////////////////////

router.get("/", async (req, res) => {

  const category = req.query.category ? { category: req.query.category } : {};

  const searchKeyword = req.query.searchKeyword
    ? {
        name: {
          $regex: req.query.searchKeyword,
          $options: "i",
        },
      }
    : {};

  const sortOrder = req.query.sortOrder
    ? req.query.sortOrder === "lowest"
      ? { price: 1 }
      : { price: -1 }
    : { _id: -1 };

  const { page = 1, limit  } = req.query;

  try{
  const products = await Product.find({ ...category, ...searchKeyword })
  .sort(sortOrder)
  .limit(limit * 1)
  .skip((page - 1) * limit);

  // get total documents in the Posts collection
  const count = await Product.find({ ...category, ...searchKeyword }).countDocuments();

   // return response with posts, total pages, and current page
  res.json({
    products,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    limit:limit,
    count:count
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
    
});

////////////////////////////////////POST PRODUCTS//////////////////////////////////////////


router.post("/", isAuth, isAdmin, async (req, res) => {
  const product = new Product({
    name: req.body.name,
    image: req.body.image,
    // image:req.file.path,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    description: req.body.description,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
  });

  try {
    const newProduct = await product.save();
    res.status(201).send({ message: "New Product Created", data: newProduct });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});



////////////////////////////////////GET ONE ITEM REQUEST//////////////////////////////////////////

router.get("/:id", async (req, res) => {
  try{
  const product = await Product.findOne({ _id: req.params.id });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product Not Found." });
  } } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

//////////////////////////////////////// UPDATE Product////////////////////////////////////////////////

router.put("/:id", isAuth, isAdmin,  async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (product) {
    product.name = req.body.name;
    product.price = req.body.price;
    product.image = req.body.image;
    product.brand = req.body.brand;
    product.category = req.body.category;
    product.countInStock = req.body.countInStock;
    product.description = req.body.description;
    const updatedProduct = await product.save();
    if (updatedProduct) {
      return res
        .status(200)
        .send({ message: "Product Updated", data: updatedProduct });
    }
  }
  return res.status(500).send({ message: " Error in Updating Product." });
});

//////////////////////////////////////////Delete request//////////////////////////////////////////////

router.delete("/:id", isAuth, isAdmin, async (req, res) => {
  try{
  const deletedProduct = await Product.findById(req.params.id);
  if (deletedProduct) {
    await deletedProduct.remove();
    res.send({ message: "Product Deleted" });
  } else {
    res.send("Error in Deletion.");
  }}  catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

///////////////////////////////Add Product Reviews//////////////////////////

router.post("/:id/reviews", isAuth, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    const review = {
      name: req.body.name,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, c) => c.rating + a, 0) /
      product.reviews.length;
    const updatedProduct = await product.save();
    res.status(201).send({
      data: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      message: "Review saved successfully.",
    });
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
});

module.exports = router;
