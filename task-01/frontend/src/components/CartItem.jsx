function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) {

  return (

    <div className="card cart-item">

      <div>

        <h3>
          {item.name}
        </h3>


        <p>
          Unit Price:
          {" "}
          Rs. {item.price}
        </p>


        <p>
          Available Stock:
          {" "}
          {item.available_stock}
        </p>

      </div>


      <div className="quantity-controls">

        <button
          className="secondary-btn"
          onClick={() =>
            onDecrease(
              item.product_id,
              item.quantity - 1
            )
          }
          disabled={
            item.quantity <= 1
          }
        >
          -
        </button>


        <strong>
          {item.quantity}
        </strong>


        <button
          onClick={() =>
            onIncrease(
              item.product_id,
              item.quantity + 1
            )
          }
        >
          +
        </button>

      </div>


      <p>
        Subtotal:
        {" "}
        <strong>
          Rs. {item.subtotal}
        </strong>
      </p>


      <button
        className="danger-btn"
        onClick={() =>
          onRemove(
            item.product_id
          )
        }
      >
        Remove
      </button>

    </div>

  );
}


export default CartItem;