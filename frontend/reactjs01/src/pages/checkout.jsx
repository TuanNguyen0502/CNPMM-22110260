import React, { useContext, useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Card,
  Statistic,
  message,
  Result,
} from "antd";
import { useCartContext } from "../components/context/cart.context";
import { placeOrderApi } from "../util/api";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../components/context/auth.context";

const CheckoutPage = () => {
  const { cartItems, total, loading, refreshCart } = useCartContext();
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  // Chỉ lấy những sản phẩm "được chọn" để thanh toán
  const onFinish = async (values) => {
    // Lấy thông tin từ form
    const { name, phone, address } = values;

    if (cartItems.length === 0) {
      message.error("Giỏ hàng trống!");
      return;
    }

    // Gọi API đặt hàng
    const res = await placeOrderApi(name, address, phone);
    if (res && res.EC === 0) {
      // Gọi hàm để cập nhật lại giỏ hàng (về 0)
      await refreshCart();
      setIsSuccess(true);
    } else {
      message.error(res.EM || "Đặt hàng thất bại");
    }
  };

  if (isSuccess) {
    return (
      <Result
        status="success"
        title="Đặt hàng thành công!"
        subTitle="Cảm ơn bạn đã mua hàng. Đơn hàng đang được xử lý."
        extra={[
          <Link to="/" key="home">
            <Button type="primary">Về trang chủ</Button>
          </Link>,
          <Link to="/products" key="buy">
            <Button>Tiếp tục mua sắm</Button>
          </Link>,
        ]}
      />
    );
  }

  return (
    <div style={{ padding: "30px", maxWidth: 1200, margin: "0 auto" }}>
      <h2>Thanh Toán</h2>
      <Row gutter={24}>
        {/* Form Nhập Thông Tin */}
        <Col xs={24} md={14}>
          <Card title="Thông tin giao hàng">
            <Form
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                name: auth.user?.name, // Điền sẵn tên từ tài khoản
              }}
            >
              <Form.Item
                label="Họ tên người nhận"
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ required: true, message: "Vui lòng nhập SĐT!" }]}
              >
                <Input placeholder="0909xxxxxx" />
              </Form.Item>

              <Form.Item
                label="Địa chỉ giao hàng"
                name="address"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Số nhà, đường, phường/xã..."
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  disabled={cartItems.length === 0}
                >
                  Xác nhận đặt hàng ({total.toLocaleString()} đ)
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Thông tin đơn hàng */}
        <Col xs={24} md={10}>
          <Card title="Đơn hàng của bạn">
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  marginBottom: 15,
                  borderBottom: "1px solid #eee",
                  paddingBottom: 10,
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    marginRight: 10,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                  <div style={{ color: "#888" }}>SL: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: "bold" }}>
                  {(item.price * item.quantity).toLocaleString()} đ
                </div>
              </div>
            ))}

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <Statistic
                title="Tổng cộng"
                value={total}
                suffix="đ"
                valueStyle={{ color: "#cf1322" }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CheckoutPage;
