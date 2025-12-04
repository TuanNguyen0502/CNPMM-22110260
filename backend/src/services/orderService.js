const { Order, OrderItem } = require("../models/order");
const Cart = require("../models/cart");
const CartItem = require("../models/cartItem");
const Product = require("../models/product");

const createOrderService = async (user, orderInfo) => {
  try {
    // Lấy giỏ hàng của user
    const cart = await Cart.findOne({ where: { userId: user.id } });
    if (!cart) return { EC: 1, EM: "Cart not found" };

    // Lấy các sản phẩm ĐƯỢC CHỌN (isSelected = true) trong giỏ
    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id, isSelected: true },
      include: [Product],
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
      orderId: newOrder.id,
    }));
    await OrderItem.bulkCreate(itemsToCreate);

    // Xóa các sản phẩm đã mua khỏi giỏ hàng
    await CartItem.destroy({
      where: { cartId: cart.id, isSelected: true },
    });

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
