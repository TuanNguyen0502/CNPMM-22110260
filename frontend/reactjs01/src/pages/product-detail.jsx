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
  Form,
  Input,
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
  getFavoritesApi,
  createReviewApi,
  checkUserBuyProductApi,
} from "../util/api";
import { useCartContext } from "../components/context/cart.context";

import { AuthContext } from "../components/context/auth.context";
import { useContext } from "react";

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

  const { auth } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [canReview, setCanReview] = useState(false);

  // Lấy dữ liệu khi vào trang hoặc chuyển sản phẩm
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

        // Kiểm tra sản phẩm có trong danh sách Yêu thích không
        const resFav = await getFavoritesApi();
        if (resFav && resFav.EC === 0) {
          // resFav.data là mảng các sản phẩm đã thích
          // Kiểm tra xem ID sản phẩm hiện tại có trong danh sách đó không
          const isLiked = resFav.data.some((item) => item.id === +id);
          setIsFavorite(isLiked);
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
    // Lấy danh sách đã xem từ localStorage
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
      // Gọi API chuyển trạng thái yêu thích
      const res = await toggleFavoriteApi(id);
      if (res && res.EC === 0) {
        setIsFavorite(res.status); // Backend trả về status: true (đã like) / false (chưa like)
        notification.success({ message: res.EM });
      }
    } catch (e) {
      notification.error({ message: "Cần đăng nhập để thực hiện!" });
    }
  };

  // Kiểm tra người dùng đã mua hàng chưa để cho phép đánh giá
  useEffect(() => {
    const checkBuy = async () => {
      if (auth.isAuthenticated && id) {
        // Gọi API kiểm tra người dùng đã mua sản phẩm chưa
        const res = await checkUserBuyProductApi(id);
        if (res && res.EC === 0) {
          setCanReview(res.data); // data là true/false
        }
      } else {
        setCanReview(false); // Chưa đăng nhập thì không được đánh giá
      }
    };
    checkBuy();
  }, [auth.isAuthenticated, id]);

  const onFinishReview = async (values) => {
    const { content, rating } = values;

    // Gọi API tạo review
    const res = await createReviewApi(id, content, rating);

    if (res && res.EC === 0) {
      notification.success({ message: "Gửi đánh giá thành công!" });
      form.resetFields();

      // Gọi lại API thống kê để cập nhật danh sách bình luận mới nhất ngay lập tức
      const resStats = await getProductStatsApi(id);
      if (resStats && resStats.EC === 0) {
        setStats(resStats.data);
      }
    } else {
      notification.error({ message: "Gửi thất bại", description: res.EM });
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
            {/* --- FORM ĐÁNH GIÁ --- */}
            {/* Kiểm tra người dùng đã đăng nhập chưa */}
            {auth.isAuthenticated ? (
              canReview ? (
                // TRƯỜNG HỢP 1: Đã đăng nhập + Đã mua hàng -> Hiện Form
                <div style={{ marginBottom: 30 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <Avatar icon={<UserOutlined />} />
                    <Text strong>{auth.user.name}</Text>
                  </div>
                  <Form
                    form={form}
                    onFinish={onFinishReview}
                    initialValues={{ rating: 5 }}
                  >
                    <Form.Item name="rating" label="Đánh giá">
                      <Rate />
                    </Form.Item>
                    <Form.Item
                      name="content"
                      rules={[
                        { required: true, message: "Vui lòng nhập nội dung!" },
                      ]}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                      />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">
                      Gửi đánh giá
                    </Button>
                  </Form>
                  <Divider />
                </div>
              ) : (
                // TRƯỜNG HỢP 2: Đã đăng nhập + Chưa mua hàng -> Hiện thông báo
                <div
                  style={{
                    marginBottom: 20,
                    color: "#faad14",
                    fontStyle: "italic",
                  }}
                >
                  <SafetyCertificateOutlined /> Bạn cần mua sản phẩm này để viết
                  đánh giá.
                  <Divider />
                </div>
              )
            ) : (
              // TRƯỜNG HỢP 3: Chưa đăng nhập -> Hiện link đăng nhập
              <div
                style={{ marginBottom: 20, fontStyle: "italic", color: "#888" }}
              >
                Vui lòng{" "}
                <span
                  style={{ color: "#1677ff", cursor: "pointer" }}
                  onClick={() => navigate("/login")}
                >
                  đăng nhập
                </span>{" "}
                để viết đánh giá.
                <Divider />
              </div>
            )}

            {/* --- DANH SÁCH BÌNH LUẬN --- */}
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
                          style={{
                            backgroundColor: "#fde3cf",
                            color: "#f56a00",
                          }}
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
                onClick={() => navigate(`/products/${p.id}`)}
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
                  onClick={() => navigate(`/products/${p.id}`)}
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
