// src/pages/cart.jsx
import React from "react";
import { CartList } from "@tuantp2004/my-shop-cart";
import { useCartContext } from "../components/context/cart.context";
import { Button, Result } from "antd";
import { Link } from "react-router-dom";

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, total } = useCartContext();

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Giỏ hàng của bạn</h2>

      {/* Sử dụng Component từ thư viện */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <CartList
          items={cartItems}
          onRemove={removeFromCart}
          onUpdate={updateQuantity}
        />

        {/* Hiển thị tổng tiền nếu CartList của bạn chưa hiển thị hoặc muốn custom thêm */}
        {cartItems.length > 0 && (
          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <Button type="primary" size="large">
              Thanh toán (${total.toLocaleString()})
            </Button>
          </div>
        )}

        {cartItems.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <Link to="/products">
              <Button>Tiếp tục mua sắm</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
