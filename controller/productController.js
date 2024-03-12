const catchAsyncError = require("../middleware/catchAsyncError");
const productSchema = require("../models/productModels");
const ApiFeature = require("../utils/apiFeatures");
const ErrorHander = require("../utils/errorHander");
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "password",
  port: 5432,
});

// Post Api --Admin route
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      ratings,
      category,
      no_of_reviews,
      stock,
    } = req.body;
    const createProductQuery = `
      INSERT INTO products (name, description, price, ratings, category, no_of_reviews, stock)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      name,
      description,
      price,
      ratings,
      category,
      no_of_reviews,
      stock,
    ];
    const result = await pool.query(createProductQuery, values);
    res.status(201).json({ success: true, product: result.rows[0] });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// Get Api
exports.getAllProducts = async (req, res) => {
  try {
    const getAllProductsQuery = `
      SELECT * FROM products;
    `;
    const result = await pool.query(getAllProductsQuery);
    res.status(200).json({
      success: true,
      count: result.rows.length,
      products: result.rows,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// put Api
// Update single product API
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id; // Assuming product ID is passed as a route parameter

    const {
      name,
      description,
      price,
      ratings,
      category,
      no_of_reviews,
      stock,
    } = req.body;

    const updateProductQuery = `
      UPDATE products
      SET name = $1, description = $2, price = $3, ratings = $4, category = $5, no_of_reviews = $6, stock = $7
      WHERE id = $8
      RETURNING *;
    `;
    const values = [
      name,
      description,
      price,
      ratings,
      category,
      no_of_reviews,
      stock,
      productId,
    ];

    const result = await pool.query(updateProductQuery, values);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        product: result.rows[0],
        message: "Product updated successfully",
      });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete Api
// Delete single product API
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id; // Assuming product ID is passed as a route parameter

    const deleteProductQuery = `
      DELETE FROM products
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(deleteProductQuery, [productId]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get Api-> For finding a single product with the help of id, previously we havemade an api for get all products

exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  res.status(200).json({ success: false, product });
});

// Customer should be able to add reviews
// we will be making two functions(creating and updating reviews) in the same api

// if you have not gave any review then create function will be used

// if you have already given a review then update function will be used

// how can customer create a review?
// in the backend the structure of reviews(array) consisit of:
// user:having id of the user, name: name of user creating the review, ratings:number me hoti han, meaning kitnay stars, comment: user writing something about the product
// we have to provide all of the above this from body and push them in our database

// what if the user have already provided the view?
// should we give him the right to update the review? yes
// How can we do that?

// exports.createProductReview=catchAsyncError(async(req,res,next)=>{
//   // we have to find the product id first
//   // destructuring
//   const {productId, ratings, comment}=req.body
//     // productId:req.body.productId,
//     // // id of user
//     // // req.user-> logged in used complete decoded data is stored init
//     // user:req.user.id,
//     // name:req.user.name,
//     // // comment and ratings from body
//     // ratings:req.body.ratings,
//     // comment:req.body.comment

//   const reviews={
//     // accessing this id below
//       user:req.user.id,
//       name:req.user.name,
//       ratings:Number(ratings),
//       comment
//   }
//   // finding the product in database and after that db will be updated
//   const product=await Product.findById(req.body.productId)

//   // we can use both find and foreach methods of an array to find out the id of the user
//   // find method will check that user id in review Schema(because we have recorded the id of user during creation of review) is equal to the id of the user "logged in"
//   const isReviewed=product.reviews.find((rev)=>{rev.user.toStringify()===req.user._id.toStringify()})

//   // just update the review if it is already given
//   if(isReviewed)
//   {
//     product.reviews.forEach((rev)=>{
//       // forEach will be performed when? When the id does not match
//       // already taking updated review from body simply updating them in the product reviews array
//       if(rev=>rev.user.toStringify()===req.user._id.toStringify())
//       {
//         rev.ratings=ratings,
//         rev.comment=comment
//       }

//     })

//   }
//   // review created and saved in db
//   else
//   {
//     // saving the value of user id, name, ratings, comment
//     product.reviews.push(reviews)
//     // we also have to update the number of reviews
//     product.noOfReviews=product.reviews.length
//   }

//   // now total ratings of a product: average of all the ratings
//   const avg=0
//   product.reviews.forEach((rev)=>{
//     avg=avg+rev.rating
//   })

//   product.ratings=avg/product.reviews.length

//   await product.save({validateBeforSave:true})

//   res.status(201).json({success:true})
// })

// practice of review api

exports.productReviews = catchAsyncError(async (req, res, next) => {
  const reviews = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(req.body.rating),
    comment: req.body.comment,
  };

  const product = await Product.findById(req.body.productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        (rev.rating = req.body.rating), (rev.comment = req.body.comment);
      }
    });
  } else {
    product.reviews.push(reviews);
    product.noOfReviews = product.reviews.length;
  }

  // const not because values will be changed
  // const avg=0
  let avg = 0;
  product.reviews.forEach((rev) => {
    avg = avg + rev.rating;
  });
  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: true });

  res.status(201).json({ success: true });
});

// Api for getting all reviews of one product
exports.getProductReviews = catchAsyncError(async (req, res, next) => {
  // we will pass id of product in query
  const product = await Product.findById(req.query.id);

  // what if someone have passed wrong query
  if (!product) {
    return next(
      new ErrorHander(`Product with the id ${req.query.id} is not found`)
    );
  }

  res.status(200).json({ success: true, reviews: product.reviews });
});

// delete user api
// user and admin both can delete their own reviews
// when we will delete the review then "ratings"(total) will be effected
// Deleting a review requires productId and id of th review we wonna delete
exports.deleteReviews = catchAsyncError(async (req, res, next) => {
  // we will pass id of product in query
  const product = await Product.findById(req.query.productId);

  // what if someone have passed wrong query
  if (!product) {
    return next(
      new ErrorHander(`Product with the id ${req.query.productId} is not found`)
    );
  }
  // making a variable consisting all those reviews that we need
  // .filter method will be used to get those reviews that we need
  // console.log(req.query.id): this id will be provided by us and this is the id that we want to delete
  // rev._id: This has the id of all the reviews stored in the "reviews array"
  // "reviews" now consist of the reviews only we want not the deleted one

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  // if any review is deleted then it will effect the overall "ratings" and "noOfReviews" will be decreased also

  let avg = 0;

  reviews.forEach((rev) => {
    avg = avg + rev.rating;
  });

  // overall rating of product
  const ratings = avg / reviews.length;

  const noOfReviews = reviews.length;

  // we need updation in the product therefore
  // findByIdAndUpdate: kisko update krna ha, uska kiya kiya update krna ha, formality
  await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews, ratings, noOfReviews },
    { run: true, useFindAndModify: false, runValidators: true }
  );

  res.status(200).json({ success: true });
});
