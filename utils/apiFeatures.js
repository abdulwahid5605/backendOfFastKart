class ApiFeature {
  // this.query is a value
  constructor(query, queryStr) {
    // query will be containing of product.find() method of database
    // querystr is the keyword searched by user
    this.query = query;
    this.queryStr = queryStr;
  }

  Search() {
    const keyword = this.queryStr.keyword
      ? {
          // this name is fetched from the backend of the database
          name: {
            // it is mongodb operator which is also known as regular expression
            $regex: this.queryStr.keyword,
            // options is used to control case insensitivity means if options is not used and you search ABC and the product name is abc then i wont be able to search for it
            $options: "i",
          },
        }
      : {};

    // testing
    // console.log(keyword)

    // now modifying out product.find()->this.query method to find the keyword only
    this.query = this.query.find({ ...keyword });

    return this;
  }

  // filtering catagories
  // this function is used to delete the pages, limit and keywords. It will only respond to the query of catgories
  // filtering prices
  // this function will take the user query(price). Prices are given in range like greater then, greater then equal to, less then or less then equal to. No one can say that i want a product whose price is 1200
  filter() {
    // "spread operators" are used to create copies. If we store this.querystr directly in querycopy variable then the orignal querystr will be changed hence it can effect the search operation as well

    const queryCopy = { ...this.queryStr };

    // it will consist all the values including keyword, page and limit
    // console.log(queryCopy)

    // we want to remove these fields
    const removeFields = ["keyword", "page", "limit"];

    // it will remove all the values including keyword, page and limit
    // key is holding index numbers
    removeFields.forEach((key) => delete queryCopy[key]);

    // testing
    // in mongo db "$" is written before every key
    // console.log(queryCopy)

    // Filter Price and rating
    // converting the object into string
    let queryStr = JSON.stringify(queryCopy);

    // /\b-> regex
    // key is holding gt,gte,lt,lte and we are adding dollar behind it
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

    // testing
    // console.log(queryStr)

    // using Product.find() method to find the prduct with the only help of catagory
    // why we have not passed it in the form of object? Because it is already an object
    // catagory finding method
    // this.query=this.query.find(queryCopy)

    // price finding method
    // converting string back into object
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  pagination(resultPerPage) {
    // user will pass a query of page and we are converting it into number
    const currentPage = Number(this.queryStr.page) || 1;

    // what is skip doing? it is skipping the products especially when moving to page 2 and onwards
    const skip = resultPerPage * (currentPage - 1);

    // using find method again
    // what is limit? it is a mongodb operator jisko hum ye batatay han result per page kitnay products dikhany
    // what is skip? it is a mongodb operator jisko hum ye batatay han result per page kitnay products skip krnay han
    this.query = this.query.limit(resultPerPage).skip(skip);
    return this;
  }
}

module.exports = ApiFeature;
