import { createContext, useContext, useEffect, useState } from "react";
import { notification } from "antd";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_MY_CART,
  ADD_TO_CART,
  UPDATE_CART_QUANTITY,
  REMOVE_CART_ITEM,
} from "../../graphql/cart.queries";

// Tạo Context
export const CartContext = createContext(null);

// Tạo Provider Wrapper
// Wrapper này sẽ bao bọc các component cần dùng giỏ hàng
// Nó sẽ chịu trách nhiệm kết nối với GraphQL Server
// để lấy dữ liệu giỏ hàng thực từ DB
// Sau đó cung cấp dữ liệu đã được "chuẩn hóa" cho các component con sử dụng
export const CartWrapper = ({ children }) => {
  // 1. Fetch dữ liệu từ GraphQL Server (Luôn lấy mới nhất)
  const { data, loading, refetch } = useQuery(GET_MY_CART, {
    fetchPolicy: "network-only", // Luôn lấy dữ liệu mới nhất từ server
    notifyOnNetworkStatusChange: true, // Cho phép loading khi refetch
  });

  // 2. Các hàm Mutation để thay đổi dữ liệu Server
  const [addToCartMutation] = useMutation(ADD_TO_CART);
  const [updateQuantityMutation] = useMutation(UPDATE_CART_QUANTITY);
  const [removeItemMutation] = useMutation(REMOVE_CART_ITEM);

  // State lưu trữ dữ liệu đã được "chuẩn hóa" cho thư viện UI
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  // 3. EFFECT QUAN TRỌNG: Đồng bộ dữ liệu Server -> UI Thư viện
  useEffect(() => {
    // Kiểm tra dữ liệu trả về từ server
    if (data?.myCart) {
      // Lấy mảng items từ server
      const serverItems = data.myCart.items || [];

      // BƯỚC LỌC QUAN TRỌNG: Loại bỏ các item bị null (do sản phẩm gốc bị xóa)
      // Nếu không có bước này, trang web sẽ bị crash trắng trang
      const validItems = serverItems.filter((item) => item && item.product);

      // BƯỚC MAP: Chuyển đổi cấu trúc GraphQL sang cấu trúc phẳng mà thư viện yêu cầu
      // Thư viện cần object dạng: { id, name, price, quantity, image }
      const mappedItems = validItems.map((item) => ({
        id: item.id, // ID của CartItem (dùng để xóa/sửa)
        name: item.product.name, // Tên sản phẩm
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
        productId: item.product.id, // Lưu thêm ID gốc nếu cần
      }));

      setCartItems(mappedItems);
      // Lấy tổng tiền trực tiếp từ backend tính toán
      setTotal(data.myCart.grandTotal || 0);
    }
  }, [data]);

  // 4. Override hàm Thêm: Gọi API thay vì sửa state local
  const addToCart = async (product) => {
    try {
      await addToCartMutation({
        variables: {
          productId: product.id,
          quantity: 1,
        },
      });
      await refetch(); // Bắt buộc: Tải lại dữ liệu mới nhất từ server
      notification.success({ message: "Đã thêm vào giỏ hàng!" });
    } catch (error) {
      notification.error({
        message: "Lỗi thêm giỏ hàng",
        description: error.message,
      });
    }
  };

  // 5. Override hàm Xóa: Gọi API xóa trong DB
  const removeFromCart = async (cartItemId) => {
    try {
      await removeItemMutation({
        variables: { cartItemId },
      });
      await refetch(); // Tải lại giao diện
      notification.success({ message: "Đã xóa sản phẩm!" });
    } catch (error) {
      notification.error({ message: "Lỗi xóa", description: error.message });
    }
  };

  // 6. Override hàm Sửa số lượng
  const updateQuantity = async (cartItemId, qty) => {
    try {
      await updateQuantityMutation({
        variables: { cartItemId, quantity: qty },
      });
      await refetch(); // Tải lại để cập nhật tổng tiền
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems, // Danh sách item (đã lấy từ DB)
        addToCart, // Hàm thêm (đã nối API)
        removeFromCart, // Hàm xóa (đã nối API)
        updateQuantity, // Hàm sửa (đã nối API)
        total, // Tổng tiền (từ DB)
        loading,
        refreshCart: refetch,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);
