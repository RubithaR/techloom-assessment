function OrderStatus({
  status,
}) {

  if (!status) {
    return null;
  }


  return (

    <span
      className={
        `status status-${status.toLowerCase()}`
      }
    >
      {status}
    </span>

  );
}


export default OrderStatus;