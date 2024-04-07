// Import necessary modules
const prisma = require("../DB/db.config");

// Create a product attribute
exports.createProductAttribute = async (req, res) => {
  const { name, style, value } = req.body;

  try {
    const createdAttribute = await prisma.productAttribute.create({
      data: {
        name,
        style,
        value,
      },
    });
    res.status(201).json(createdAttribute);
  } catch (error) {
    console.error("Error creating product attribute:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all product attributes
exports.getProductAttribute = async (req, res) => {
  try {
    const attributes = await prisma.productAttribute.findMany();
    res.json(attributes);
  } catch (error) {
    console.error("Error getting product attributes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a product attribute by ID
exports.getSingleProductAttribute = async (req, res) => {
  const { id } = req.params;

  try {
    const attribute = await prisma.productAttribute.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!attribute) {
      return res.status(404).json({ message: "Attribute not found" });
    }
    res.json(attribute);
  } catch (error) {
    console.error("Error getting product attribute by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a product attribute
exports.updateProductAttribute = async (req, res) => {
  const { id } = req.params;
  const { name, style, value } = req.body;

  try {
    const updatedAttribute = await prisma.productAttribute.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        style,
        value,
      },
    });
    res.json(updatedAttribute);
  } catch (error) {
    console.error("Error updating product attribute:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a product attribute
exports.deleteProductAttribute = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.productAttribute.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.json({ message: "Attribute deleted successfully" });
  } catch (error) {
    console.error("Error deleting product attribute:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
