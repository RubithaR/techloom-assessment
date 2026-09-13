import * as cartService
  from "../services/cartService.js";


export const createCart = async (req, res) => {
  try {
    const cart = await cartService.createCart();

    res.status(201).json({
      success: true,
      message: "Cart created successfully",
      data: cart
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "failed to create cart"
    });
  }
};


export const getCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await cartService.getCartById(id);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve cart"
    });
  }
};


export const addItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, quantity } = req.body;

    if ( !productId || !quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "productId and a positive quantity are required"
      });
    }


    const item = await cartService.addItemToCart( id,productId,quantity  );

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      data: item
    });

  } catch (error) {
    if (error.message === "Cart_not_found") {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    if (error.message === "Product_not_found") {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (error.message === "Cart_not_Active") {
      return res.status(409).json({
        success: false,
        message: "Cart is no longer active"
      });
    }

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to add item"
    });
  }
};


export const updateItem = async (req, res) => {
  try {

    const { id, productId } = req.params;

    const { quantity } = req.body;


    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be greater than 0"
      });
    }


    const item = await cartService.updateCartItem( id,  productId, quantity );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }


    res.status(200).json({
      success: true,
      message: "Cart item updated",
      data: item
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update cart item"
    });
  }
};


export const removeItem = async (req, res) => {
  try {
    const { id, productId } = req.params;
    const item = await cartService.removeCartItem( id, productId  );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Item removed from cart"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to remove cart item"
    });
  }
};