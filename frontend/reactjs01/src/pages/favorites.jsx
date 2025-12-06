import { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Typography,
  Spin,
  Empty,
  Button,
  notification,
} from "antd";
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { getFavoritesApi, toggleFavoriteApi } from "../util/api";
import { useCartContext } from "../components/context/cart.context";

const { Title, Text } = Typography;

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCartContext();

  const fetchFavorites = async () => {
    setLoading(true);
    // Lấy danh sách yêu thích từ API
    const res = await getFavoritesApi();
    // Cập nhật state nếu thành công
    if (res && res.EC === 0) {
      setFavorites(res.data);
    }
    setLoading(false);
  };

  // Load danh sách yêu thích khi component được mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  // Xử lý bỏ yêu thích
  const handleUnfavorite = async (e, productId) => {
    e.stopPropagation(); // Ngăn sự kiện click vào Card
    // Gọi API để bỏ yêu thích
    const res = await toggleFavoriteApi(productId);
    if (res && res.EC === 0) {
      notification.success({ message: "Đã xóa khỏi danh sách yêu thích" });
      fetchFavorites(); // Load lại danh sách để cập nhật UI
    }
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation(); // Ngăn sự kiện click vào Card
    // Thêm sản phẩm vào giỏ hàng
    addToCart(product);
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" />
      </div>
    );

  return (
    <div style={{ padding: 30, maxWidth: 1200, margin: "0 auto" }}>
      <Title level={2}>Sản phẩm yêu thích ❤️</Title>

      {favorites.length === 0 ? (
        <Empty
          description="Bạn chưa có sản phẩm yêu thích nào"
          style={{ marginTop: 50 }}
        >
          <Link to="/products">
            <Button type="primary">Đi mua sắm ngay</Button>
          </Link>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {favorites.map((item) => (
            <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                cover={
                  <img
                    alt={item.name}
                    src={item.image}
                    style={{ height: 200, objectFit: "contain", padding: 10 }}
                  />
                }
                onClick={() => navigate(`/products/${item.id}`)}
                actions={[
                  <Button
                    type="text"
                    icon={<ShoppingCartOutlined />}
                    onClick={(e) => handleAddToCart(e, item)}
                    key="cart"
                  />,
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/products/${item.id}`)}
                    key="view"
                  />,
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => handleUnfavorite(e, item.id)}
                    key="delete"
                  />,
                ]}
              >
                <Card.Meta
                  title={item.name}
                  description={
                    <Text type="danger" strong>
                      {item.price?.toLocaleString()} đ
                    </Text>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default FavoritesPage;
