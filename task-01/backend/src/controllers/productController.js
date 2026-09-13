import * as productService from "../services/productService.js";


export const getProducts = async(req, res)=>{
    try {const products = await productService.getAllProducts();    
        res.status(200).json({
            success: true,
            data:products
        });
    } catch(error){
        console.error(error);
        res.status(500).json({
            success:false,
            message: "failed to retrieve products"
        });
    }
};

export const getProduct = async(req, res)=>{
    try{
        const {id}=req.params ;
        const product = await productService.getAllProductById(id);
        if(!product){
            return res.status(404).json({
                success:false,
                message: " product not found"
            });
        }
        res.status(200).json({
            success:true,
            data:product
        });
    } catch(error){
        console.error(error);
        res.status(500).json({
            success:false,
            message: "Failed to retrieve product "
        });
    }
}

export const createProduct = async (req, res) => {
  try {
    const {name, price, availableStock,} = req.body;

    if (!name || price === undefined || availableStock === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "name, price and availableStock are required",
      });
    }

    if ( Number(price) < 0 || Number(availableStock) < 0 ) {
      return res.status(400).json({
        success: false,
        message:
          "Price and available stock cannot be negative",
      });
    }

    const product = await productService.createProduct(name, price, availableStock );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {name,  price, availableStock,
    } = req.body;

    if ( !name || price === undefined || availableStock === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "name, price and availableStock are required",
      });
    }

    const product =
      await productService.updateProduct(id, name,  price, availableStock );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productService.deleteProduct(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};