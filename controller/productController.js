const catchAsyncError = require("../middleware/catchAsyncError");
const prisma = require("../DB/db.config");

// Post Api --Admin route
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      shortDescription,
      description,
      // type,
      // isExternal,
      // unit,
      // weight,
      // stockStatus,
      // SKU,
      // stockQuantity,
      // price,
      // salePrice,
      // discount,
      // saleStatus,
      // startDate,
      // endDate,
      // tags,
      // categories,
      // randomRelatedProduct,
      // relatedProduct,
      // crossSellProduct,
      // thumbnail,
      // images,
      // sizeChart,
      // metaTitle,
      // metaDescription,
      // productMetaImages,
      // freeShipping,
      // tax,
      // estimatedDeliveryText,
      // returnPolicyText,
      // featured,
      // safeCheckout,
      // secureCheckout,
      // socialShare,
      // encourageOrder,
      // encourageView,
      // trending,
      // returnStatus,
    } = req.body;

    const createdProduct = await prisma.product.create({
      data: {
        name,
        shortDescription,
        description,
        // type,
        // isExternal,
        // unit,
        // weight,
        // stockStatus,
        // SKU,
        // stockQuantity,
        // price,
        // salePrice,
        // discount,
        // saleStatus,
        // startDate,
        // endDate,
        // tags,
        // categories,
        // randomRelatedProduct,
        // relatedProduct,
        // crossSellProduct,
        // thumbnail,
        // images,
        // sizeChart,
        // metaTitle,
        // metaDescription,
        // productMetaImages,
        // freeShipping,
        // tax,
        // estimatedDeliveryText,
        // returnPolicyText,
        // featured,
        // safeCheckout,
        // secureCheckout,
        // socialShare,
        // encourageOrder,
        // encourageView,
        // trending,
        // returnStatus,
      },
    });

    res.status(201).json({ success: true, data: createdProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// Get Api
exports.getAllProducts = async (req, res) => {
  try {
    const allProducts = await prisma.product.findMany();
    res.status(200).json({ success: true, data: allProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// put Api
// Update single product API
exports.updateProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: req.body,
    });
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// Delete single product API
exports.deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    await prisma.product.delete({ where: { id: productId } });
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// get single product Api
exports.getProductDetails = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productDetails = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!productDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, data: productDetails });
  } catch (error) {
    console.error("Error fetching product details:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// ------------------------------------------------------------------------------------------------------
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
