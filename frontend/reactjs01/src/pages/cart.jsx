import React from "react";
import { CartList } from "@tuantp2004/my-shop-cart"; // UI từ thư viện
import { useCartContext } from "../components/context/cart.context"; // Logic từ Context
import { Button, Spin } from "antd";
import { Link } from "react-router-dom";

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, total, loading } =
    useCartContext();

  if (loading && cartItems.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Giỏ hàng của bạn</h2>

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Thư viện nhận vào:
                   - items: danh sách đã chuẩn hóa từ Context
                   - onRemove: gọi hàm API xóa
                   - onUpdate: gọi hàm API sửa số lượng
                */}
        <CartList
          items={cartItems}
          onRemove={removeFromCart}
          onUpdate={updateQuantity}
        />

        {/* Hiển thị tổng tiền (Lấy từ server nên rất chính xác) */}
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
