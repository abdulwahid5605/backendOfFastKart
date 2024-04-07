const prisma = require("../DB/db.config");

// Post Api --Admin route
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const createdProduct = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json({ success: true, data: createdProduct });
  } catch (error) {
    console.error("Error creating category:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const allCategories = await prisma.category.findMany();
    res.status(200).json({ success: true, data: allCategories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: req.body,
    });
    res.status(200).json({ success: true, data: updatedCategory });
  } catch (error) {
    console.error("Error updating product:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};
