
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState("");

  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState("");
  const [orderError, setOrderError] = useState("");

  // =========================
  // LOAD PRODUCTS
  // =========================

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Could not load products.");
        setLoading(false);
      });
  }, []);

  // =========================
  // CART
  // =========================

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1
        }
      ];
    });
  };

  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  // =========================
  // CART TOTAL
  // =========================

  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  const cartItemsCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // =========================
  // LOAD ORDERS
  // =========================

  const loadOrders = async () => {
    setOrdersLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/orders"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();

      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const openOrders = async () => {
    setShowOrders(true);
    await loadOrders();
  };

  const closeOrders = () => {
    setShowOrders(false);
  };

  // =========================
  // CHECKOUT
  // =========================

  const openCheckout = () => {
    setOrderError("");
    setOrderSuccess("");
    setShowCheckout(true);
  };

  const closeCheckout = () => {
    if (!orderLoading) {
      setShowCheckout(false);
    }
  };

  const handleCheckout = async (event) => {
    event.preventDefault();

    setOrderLoading(true);
    setOrderError("");
    setOrderSuccess("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId: 1,
            items: cart.map((item) => ({
              productId: item.id,
              quantity: item.quantity
            }))
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create order"
        );
      }

      setOrderSuccess(
        `Order #${data.order.id} created successfully!`
      );

      setCart([]);

      setCustomerName("");
      setCustomerEmail("");

      // Refresh orders
      await loadOrders();

    } catch (error) {
      console.error(error);

      setOrderError(
        error.message || "Something went wrong."
      );
    } finally {
      setOrderLoading(false);
    }
  };

  // =========================
  // LOADING / ERROR
  // =========================

  if (loading) {
    return (
      <h2 className="loading">
        Loading products...
      </h2>
    );
  }

  if (error) {
    return (
      <h2 className="error">
        {error}
      </h2>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">

        <div>
          <h1>ShopZone</h1>
          <p>Simple E-commerce Store</p>
        </div>

        <div className="header-actions">

          <button
            className="orders-button"
            onClick={openOrders}
          >
            📦 Orders
          </button>

          <div className="cart-counter">
            🛒 Cart: {cartItemsCount}
          </div>

        </div>

      </header>

      {/* MAIN */}

      <main className="main">

        {/* PRODUCTS */}

        <section className="products-section">

          <h2>Products</h2>

          <div className="products-grid">

            {products.map((product) => (

              <div
                className="product-card"
                key={product.id}
              >

                <div className="product-image">
                  🛍️
                </div>

                <div className="product-content">

                  <h3>
                    {product.name}
                  </h3>

                  <p>
                    {product.description}
                  </p>

                  <div className="product-bottom">

                    <strong>
                      $
                      {Number(product.price).toFixed(2)}
                    </strong>

                    <button
                      onClick={() =>
                        addToCart(product)
                      }
                    >
                      Add to Cart
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* CART */}

        <aside className="cart">

          <h2>
            Shopping Cart
          </h2>

          {cart.length === 0 ? (

            <p className="empty-cart">
              Your cart is empty.
            </p>

          ) : (

            <>

              <div className="cart-items">

                {cart.map((item) => (

                  <div
                    className="cart-item"
                    key={item.id}
                  >

                    <div>

                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        $
                        {Number(item.price).toFixed(2)}
                      </p>

                    </div>

                    <div className="quantity">

                      <button
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                      >
                        -
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                      >
                        +
                      </button>

                    </div>

                    <button
                      className="remove"
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                    >
                      Remove
                    </button>

                  </div>

                ))}

              </div>

              <div className="cart-total">

                <span>
                  Total:
                </span>

                <strong>
                  $
                  {cartTotal.toFixed(2)}
                </strong>

              </div>

              <button
                className="checkout-button"
                onClick={openCheckout}
              >
                Checkout
              </button>

            </>

          )}

          {orderSuccess && (
            <div className="success-message">
              {orderSuccess}
            </div>
          )}

        </aside>

      </main>

      {/* CHECKOUT MODAL */}

      {showCheckout && (

        <div className="checkout-overlay">

          <div className="checkout-modal">

            <button
              className="close-button"
              onClick={closeCheckout}
              disabled={orderLoading}
            >
              ×
            </button>

            <h2>
              Checkout
            </h2>

            <p>
              Order total:
              <strong>
                ${cartTotal.toFixed(2)}
              </strong>
            </p>

            <form onSubmit={handleCheckout}>

              <div className="form-group">

                <label htmlFor="name">
                  Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(
                      event.target.value
                    )
                  }
                  placeholder="Your name"
                  required
                />

              </div>

              <div className="form-group">

                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(event) =>
                    setCustomerEmail(
                      event.target.value
                    )
                  }
                  placeholder="your@email.com"
                  required
                />

              </div>

              {orderError && (

                <div className="checkout-error">
                  {orderError}
                </div>

              )}

              {orderSuccess && (

                <div className="success-message">
                  {orderSuccess}
                </div>

              )}

              {!orderSuccess && (

                <button
                  type="submit"
                  className="place-order-button"
                  disabled={orderLoading}
                >
                  {orderLoading
                    ? "Processing..."
                    : "Place Order"}
                </button>

              )}

            </form>

          </div>

        </div>

      )}

      {/* ORDERS MODAL */}

      {showOrders && (

        <div className="checkout-overlay">

          <div className="orders-modal">

            <button
              className="close-button"
              onClick={closeOrders}
            >
              ×
            </button>

            <h2>
              📦 Orders
            </h2>

            {ordersLoading ? (

              <p>
                Loading orders...
              </p>

            ) : orders.length === 0 ? (

              <p>
                No orders found.
              </p>

            ) : (

              <div className="orders-list">

                {orders.map((order) => (

                  <div
                    className="order-card"
                    key={order.id}
                  >

                    <div className="order-header">

                      <h3>
                        Order #{order.id}
                      </h3>

                      <span className="order-status">
                        {order.status}
                      </span>

                    </div>

                    <p>
                      <strong>
                        Customer:
                      </strong>{" "}
                      {order.user_name}
                    </p>

                    <p>
                      <strong>
                        Email:
                      </strong>{" "}
                      {order.user_email}
                    </p>

                    <p>
                      <strong>
                        Total:
                      </strong>{" "}
                      $
                      {Number(
                        order.total_price
                      ).toFixed(2)}
                    </p>

                    <p>
                      <strong>
                        Date:
                      </strong>{" "}
                      {new Date(
                        order.created_at
                      ).toLocaleString()}
                    </p>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default App;