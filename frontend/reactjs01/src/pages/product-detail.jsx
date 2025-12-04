import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Image,
  Typography,
  Button,
  Tag,
  Rate,
  Card,
  List,
  Avatar,
  Divider,
  Space,
  notification,
  Spin,
} from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  UserOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
  getProductDetailApi,
  getProductStatsApi,
  getSimilarProductsApi,
  toggleFavoriteApi,
} from "../util/api";
import { useCartContext } from "../components/context/cart.context";

const { Title, Text, Paragraph } = Typography;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartContext();

  const [product, setProduct] = useState(null);
  const [stats, setStats] = useState({ sold: 0, totalReviews: 0, reviews: [] });
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy thông tin sản phẩm
        const resProd = await getProductDetailApi(id);
        if (resProd && resProd.EC === 0) {
          setProduct(resProd.data);
          handleRecentlyViewed(resProd.data); // Lưu lịch sử xem
        }

        // Lấy thống kê & Review
        const resStats = await getProductStatsApi(id);
        if (resStats && resStats.EC === 0) {
          setStats(resStats.data);
        }

        // Lấy sản phẩm tương tự
        const resSimilar = await getSimilarProductsApi(id);
        if (resSimilar && resSimilar.EC === 0) {
          setSimilarProducts(resSimilar.data);
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchData();
    // Scroll lên đầu trang khi chuyển sản phẩm
    window.scrollTo(0, 0);
  }, [id]);

  // Load danh sách đã xem từ LocalStorage lúc vào trang
  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem("recently_viewed")) || [];
    setRecentlyViewed(viewed.filter((item) => item.id !== +id)); // Loại sản phẩm hiện tại ra khỏi list
  }, [id]);

  // Hàm xử lý lưu sản phẩm đã xem
  const handleRecentlyViewed = (prod) => {
    let viewed = JSON.parse(localStorage.getItem("recently_viewed")) || [];
    // Xóa trùng
    viewed = viewed.filter((item) => item.id !== prod.id);
    // Thêm vào đầu
    viewed.unshift({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      image: prod.image,
    });
    // Giữ tối đa 6 sản phẩm
    if (viewed.length > 6) viewed.pop();
    localStorage.setItem("recently_viewed", JSON.stringify(viewed));
  };

  // Hàm xử lý Yêu thích
  const handleToggleFavorite = async () => {
    try {
      const res = await toggleFavoriteApi(id);
      if (res && res.EC === 0) {
        setIsFavorite(res.status); // Backend trả về status: true (đã like) / false (chưa like)
        notification.success({ message: res.EM });
      }
    } catch (e) {
      notification.error({ message: "Cần đăng nhập để thực hiện!" });
    }
  };

  if (loading || !product) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "30px", maxWidth: 1200, margin: "0 auto" }}>
      {/* --- THÔNG TIN CHI TIẾT --- */}
      <Card bordered={false} style={{ marginBottom: 30 }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={10}>
            <div
              style={{
                border: "1px solid #f0f0f0",
                padding: 10,
                borderRadius: 8,
              }}
            >
              <Image src={product.image} alt={product.name} width="100%" />
            </div>
          </Col>
          <Col xs={24} md={14}>
            <Title level={2}>{product.name}</Title>
            <Space size="large" style={{ marginBottom: 20 }}>
              <Tag color="volcano" style={{ fontSize: 14, padding: 5 }}>
                {stats.sold} Đã bán
              </Tag>
              <Space>
                <Rate disabled defaultValue={5} style={{ fontSize: 14 }} />
                <Text type="secondary">({stats.totalReviews} đánh giá)</Text>
              </Space>
            </Space>

            <Title level={3} type="danger" style={{ margin: "10px 0 20px" }}>
              {product.price?.toLocaleString()} đ
            </Title>

            <Paragraph>
              <SafetyCertificateOutlined style={{ color: "green" }} /> Hàng
              chính hãng 100% <br />
              <SafetyCertificateOutlined style={{ color: "green" }} /> Bảo hành
              12 tháng
            </Paragraph>

            <Space size="middle" style={{ marginTop: 20 }}>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={() => addToCart(product)}
              >
                Thêm vào giỏ
              </Button>
              <Button
                size="large"
                icon={
                  isFavorite ? (
                    <HeartFilled style={{ color: "red" }} />
                  ) : (
                    <HeartOutlined />
                  )
                }
                onClick={handleToggleFavorite}
              >
                {isFavorite ? "Đã thích" : "Yêu thích"}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* --- BÌNH LUẬN & ĐÁNH GIÁ --- */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title={`Đánh giá & Bình luận (${stats.totalReviews})`}>
            {stats.reviews.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={stats.reviews}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<UserOutlined />}
                          style={{ backgroundColor: "#87d068" }}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>{item.User?.name || "Khách hàng"}</Text>
                          <Rate
                            disabled
                            defaultValue={item.rating}
                            style={{ fontSize: 12 }}
                          />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </Text>
                        </Space>
                      }
                      description={item.content}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Text type="secondary">Chưa có bình luận nào.</Text>
            )}
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* --- SẢN PHẨM TƯƠNG TỰ (ELASTICSEARCH) --- */}
      <div style={{ marginBottom: 40 }}>
        <Title level={4}>Sản phẩm tương tự</Title>
        <Row gutter={[16, 16]}>
          {similarProducts.map((p) => (
            <Col key={p.id} xs={12} sm={8} md={6} lg={4}>
              <Card
                hoverable
                cover={
                  <img
                    alt={p.name}
                    src={p.image}
                    style={{ height: 150, objectFit: "contain", padding: 10 }}
                  />
                }
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <Card.Meta
                  title={p.name}
                  description={
                    <Text type="danger">{p.price?.toLocaleString()} đ</Text>
                  }
                />
              </Card>
            </Col>
          ))}
          {similarProducts.length === 0 && (
            <Text>Không tìm thấy sản phẩm tương tự.</Text>
          )}
        </Row>
      </div>

      {/* --- SẢN PHẨM ĐÃ XEM (LOCALSTORAGE) --- */}
      {recentlyViewed.length > 0 && (
        <div>
          <Title level={4}>
            <EyeOutlined /> Sản phẩm bạn đã xem
          </Title>
          <Row gutter={[16, 16]}>
            {recentlyViewed.map((p) => (
              <Col key={p.id} xs={12} sm={8} md={6} lg={4}>
                <Card
                  hoverable
                  size="small"
                  cover={
                    <img
                      alt={p.name}
                      src={p.image}
                      style={{ height: 120, objectFit: "contain", padding: 10 }}
                    />
                  }
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div
                    style={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {p.name}
                  </div>
                  <Text type="danger">{p.price?.toLocaleString()} đ</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
