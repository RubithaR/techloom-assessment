function ProductCard({
  product,
  onAddToCart,
}) {
  return (
    <div className="card">
      <h3>{product.name}</h3>

      <p>
        Rs. {product.price}
      </p>

      <p>
        Stock:{" "}
        {product.available_stock}
      </p>

      <button
        disabled={
          product.available_stock <= 0
        }
        onClick={() =>
          onAddToCart(product.id)
        }
      >
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;