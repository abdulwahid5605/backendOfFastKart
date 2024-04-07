const prisma = require("../DB/db.config");

exports.getTheme = async (req, res) => {
  try {
    // Extract the theme parameter from the request URL
    const theme = req.query.slug;

    // Implement logic to fetch the theme data based on the theme parameter
    let data;
    if (theme === "paris") {
      data = {
        data: {
          mainBannerUrl:
            "https://img.freepik.com/free-photo/chicken-wings-barbecue-sweetly-sour-sauce-picnic-summer-menu-tasty-food-top-view-flat-lay_2829-6471.jpg?size=626&ext=jpg&ga=GA1.1.735520172.1710979200&semt=sph",
          subBannerUrl:
            "https://thumbs.dreamstime.com/b/different-spices-herbs-stone-table-top-view-ingredients-cooking-food-background-different-spices-herbs-black-120232209.jpg",

          bannersData: [
            "https://img.freepik.com/free-photo/chicken-wings-barbecue-sweetly-sour-sauce-picnic-summer-menu-tasty-food-top-view-flat-lay_2829-6471.jpg?size=626&ext=jpg&ga=GA1.1.735520172.1710979200&semt=sph",

            "https://img.freepik.com/free-photo/chicken-wings-barbecue-sweetly-sour-sauce-picnic-summer-menu-tasty-food-top-view-flat-lay_2829-6471.jpg?size=626&ext=jpg&ga=GA1.1.735520172.1710979200&semt=sph",

            "https://img.freepik.com/free-photo/chicken-wings-barbecue-sweetly-sour-sauce-picnic-summer-menu-tasty-food-top-view-flat-lay_2829-6471.jpg?size=626&ext=jpg&ga=GA1.1.735520172.1710979200&semt=sph",

            "https://img.freepik.com/free-photo/chicken-wings-barbecue-sweetly-sour-sauce-picnic-summer-menu-tasty-food-top-view-flat-lay_2829-6471.jpg?size=626&ext=jpg&ga=GA1.1.735520172.1710979200&semt=sph",
          ],
        },
      };
    } else if (theme === "rome") {
      // Fetch Rome theme data
      data = {
        themeName: "Rome Theme",
        // Add other theme-specific data here
      };
    } else {
      // Handle invalid or unsupported themes
      return res.status(404).json({ error: "Theme not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error retrieving theme:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
