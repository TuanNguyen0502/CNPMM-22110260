const { Order, OrderItem } = require("../models/order");
const Cart = require("../models/cart");
const CartItem = require("../models/cartItem");
const Product = require("../models/product");

const createOrderService = async (user, orderInfo) => {
  try {
    // Lấy giỏ hàng của user
    const cart = await Cart.findOne({ where: { userId: user.id } });
    // Kiểm tra xem giỏ hàng có tồn tại không
    // Nếu không tồn tại, trả về lỗi
    // EC là Error Code, EM là Error Message
    // 1 là mã lỗi chung (như không tìm thấy, lỗi server, v.v.)
    // 2 là mã lỗi cụ thể hơn (như thiếu thông tin, v.v.)
    // 0 là không có lỗi
    if (!cart) return { EC: 1, EM: "Cart not found" };

    // Lấy các sản phẩm ĐƯỢC CHỌN (isSelected = true) trong giỏ
    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id, isSelected: true },
      include: [Product], // Bao gồm thông tin sản phẩm
    });

    if (cartItems.length === 0) {
      return { EC: 1, EM: "No items selected to checkout" };
    }

    // Tính tổng tiền
    let totalPrice = 0;
    const orderItemsData = cartItems.map((item) => {
      const price = item.Product.price;
      const quantity = item.quantity;
      totalPrice += price * quantity;
      return {
        productId: item.productId,
        quantity: quantity,
        price: price,
      };
    });

    // Tạo đơn hàng
    const newOrder = await Order.create({
      userId: user.id,
      totalPrice: totalPrice,
      receiverName: orderInfo.name,
      receiverAddress: orderInfo.address,
      receiverPhone: orderInfo.phone,
      status: "pending",
    });

    // Tạo chi tiết đơn hàng
    const itemsToCreate = orderItemsData.map((item) => ({
      ...item,
      orderId: newOrder.id, // Thêm orderId vào mỗi chi tiết đơn hàng, id lấy từ đơn hàng mới tạo
    }));
    // Tạo chi tiết đơn hàng trong cơ sở dữ liệu
    // Sử dụng bulkCreate để tạo nhiều bản ghi cùng lúc
    await OrderItem.bulkCreate(itemsToCreate);

    // Xóa các sản phẩm đã mua khỏi giỏ hàng
    await CartItem.destroy({
      where: { cartId: cart.id, isSelected: true },
    });

    // Trả về kết quả thành công
    return {
      EC: 0,
      EM: "Order placed successfully",
      data: newOrder,
    };
  } catch (error) {
    console.log(error);
    return { EC: 1, EM: "Error creating order" };
  }
};

module.exports = { createOrderService };
