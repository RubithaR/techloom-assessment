import * as productService
  from "../services/productService.js";


  
export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
    } = req.query;


    const parsedMinPrice =
      minPrice !== undefined
        ? Number(minPrice)
        : undefined;

    const parsedMaxPrice =
      maxPrice !== undefined
        ? Number(maxPrice)
        : undefined;


    if (
      parsedMinPrice !== undefined &&
      Number.isNaN(parsedMinPrice)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum price must be a valid number",
      });
    }


    if (
      parsedMaxPrice !== undefined &&
      Number.isNaN(parsedMaxPrice)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum price must be a valid number",
      });
    }


    if (
      parsedMinPrice !== undefined &&
      parsedMinPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum price cannot be negative",
      });
    }


    if (
      parsedMaxPrice !== undefined &&
      parsedMaxPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum price cannot be negative",
      });
    }


    if (
      parsedMinPrice !== undefined &&
      parsedMaxPrice !== undefined &&
      parsedMinPrice > parsedMaxPrice
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum price cannot be greater than maximum price",
      });
    }


    const products =
      await productService.getProducts({
        search,
        category,
        minPrice: parsedMinPrice,
        maxPrice: parsedMaxPrice,
      });


    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });

  } catch (error) {
    console.error(
      "Get products error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve products",
    });
  }
};


// GET SINGLE PRODUCT


export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;


    const product =
      await productService.getProductById(id);


    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }


    return res.status(200).json({
      success: true,
      data: product,
    });

  } catch (error) {
    console.error(
      "Get product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve product",
    });
  }
};



// CREATE PRODUCT

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      availableStock,
    } = req.body;


    if (
      !name ||
      price === undefined ||
      availableStock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, price and availableStock are required",
      });
    }


    const numericPrice =
      Number(price);

    const numericStock =
      Number(availableStock);


    if (
      Number.isNaN(numericPrice) ||
      Number.isNaN(numericStock)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Price and stock must be valid numbers",
      });
    }


    if (
      numericPrice < 0 ||
      numericStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Price and stock cannot be negative",
      });
    }


    if (!Number.isInteger(numericStock)) {
      return res.status(400).json({
        success: false,
        message:
          "Stock must be a whole number",
      });
    }


    const product =
      await productService.createProduct({
        name: name.trim(),

        description:
          description?.trim() || null,

        category:
          category?.trim() || "General",

        price: numericPrice,

        availableStock:
          numericStock,
      });


    return res.status(201).json({
      success: true,
      message:
        "Product created successfully",
      data: product,
    });

  } catch (error) {
    console.error(
      "Create product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create product",
    });
  }
};


// UPDATE PRODUCT

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      category,
      price,
      availableStock,
    } = req.body;


    if (
      !name ||
      price === undefined ||
      availableStock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, price and availableStock are required",
      });
    }


    const numericPrice =
      Number(price);

    const numericStock =
      Number(availableStock);


    if (
      Number.isNaN(numericPrice) ||
      Number.isNaN(numericStock)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Price and stock must be valid numbers",
      });
    }


    if (
      numericPrice < 0 ||
      numericStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Price and stock cannot be negative",
      });
    }


    if (!Number.isInteger(numericStock)) {
      return res.status(400).json({
        success: false,
        message:
          "Stock must be a whole number",
      });
    }


    const product =
      await productService.updateProduct(
        id,
        {
          name: name.trim(),

          description:
            description?.trim() || null,

          category:
            category?.trim() || "General",

          price: numericPrice,

          availableStock:
            numericStock,
        }
      );


    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }


    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      data: product,
    });

  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update product",
    });
  }
};


// SOFT DELETE PRODUCT

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;


    const product =
      await productService.deleteProduct(id);


    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }


    return res.status(200).json({
      success: true,
      message:
        "Product removed successfully",
    });

  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to remove product",
    });
  }
};