import { useEffect, useState } from "react";
import "./App.css";

function App() {
const [products, setProducts] = useState([]);
const [cart, setCart] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [showCheckout, setShowCheckout] = useState(false);
const [customerName, setCustomerName] = useState("");
const [customerEmail, setCustomerEmail] = useState("");
const [orderLoading, setOrderLoading] = useState(false);
const [orderMessage, setOrderMessage] = useState("");
const [orderError, setOrderError] = useState("");

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

const addToCart = (product) => {
setCart((currentCart) => {
const existingProduct = currentCart.find(
(item) => item.id === product.id
);

  if (existingProduct) {
    return currentCart.map((item) =>
      item.id === product.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  }

  return [...currentCart, { ...product, quantity: 1 }];
});

};

const increaseQuantity = (id) => {
setCart((currentCart) =>
currentCart.map((item) =>
item.id === id
? { ...item, quantity: item.quantity + 1 }
: item
)
);
};

const decreaseQuantity = (id) => {
setCart((currentCart) =>
currentCart
.map((item) =>
item.id === id
? { ...item, quantity: item.quantity - 1 }
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

const cartTotal = cart.reduce(
(total, item) => total + Number(item.price) * item.quantity,
0
);

const cartItemsCount = cart.reduce(
(total, item) => total + item.quantity,
0
);

const openCheckout = () => {
setOrderMessage("");
setOrderError("");
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
setOrderMessage("");
setOrderError("");

try {
  const response = await fetch("http://localhost:3000/api/orders", {
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
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create order");
  }

  setOrderMessage(
    `Order #${data.order.id} created successfully! Total: $${Number(
      data.order.total_price ?? data.order.total
    ).toFixed(2)}`
  );

  setCart([]);
  setCustomerName("");
  setCustomerEmail("");
  setShowCheckout(false);
} catch (error) {
  console.error(error);
  setOrderError(error.message || "Could not create order.");
} finally {
  setOrderLoading(false);
}


};

if (loading) {
return <h2 className="loading">Loading products...</h2>;
}

if (error) {
return <h2 className="error">{error}</h2>;
}

return ( <div className="app"> <header className="header"> <div> <h1>ShopZone</h1> <p>Simple E-commerce Store</p> </div>

    <div className="cart-counter">
      🛒 Cart: {cartItemsCount}
    </div>
  </header>

  <main className="main">
    <section className="products-section">
      <h2>Products</h2>

      <div className="products-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <div className="product-image">
              🛍️
            </div>

            <div className="product-content">
              <h3>{product.name}</h3>

              <p>{product.description}</p>

              <div className="product-bottom">
                <strong>
                  ${Number(product.price).toFixed(2)}
                </strong>

                <button onClick={() => addToCart(product)}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    <aside className="cart">
      <h2>Shopping Cart</h2>

      {cart.length === 0 ? (
        <p className="empty-cart">
          Your cart is empty.
        </p>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div>
                  <h3>{item.name}</h3>

                  <p>
                    ${Number(item.price).toFixed(2)}
                  </p>
                </div>

                <div className="quantity">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => increaseQuantity(item.id)}
                  >
                    +
                  </button>
                </div>

                <button
                  className="remove"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-total">
            <span>Total:</span>

            <strong>
              ${cartTotal.toFixed(2)}
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

      {orderMessage && (
        <div className="success-message">
          {orderMessage}
        </div>
      )}

      {orderError && (
        <div className="error-message">
          {orderError}
        </div>
      )}
    </aside>
  </main>

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

        <h2>Checkout</h2>

        <p>
          Order total: <strong>${cartTotal.toFixed(2)}</strong>
        </p>

        <form onSubmit={handleCheckout}>
          <label>
            Full Name
            <input
              type="text"
              value={customerName}
              onChange={(event) =>
                setCustomerName(event.target.value)
              }
              placeholder="Enter your name"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={customerEmail}
              onChange={(event) =>
                setCustomerEmail(event.target.value)
              }
              placeholder="Enter your email"
              required
            />
          </label>

          <button
            type="submit"
            className="place-order-button"
            disabled={orderLoading}
          >
            {orderLoading ? "Creating Order..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  )}
</div>

);
}

export default App;
