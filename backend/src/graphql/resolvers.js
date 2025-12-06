const Cart = require("../models/cart");
const CartItem = require("../models/cartItem");
const Product = require("../models/product");

// Helper function để lấy hoặc tạo giỏ hàng cho user
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ where: { userId, status: "active" } });
  if (!cart) {
    cart = await Cart.create({ userId });
  }
  return cart;
};

const resolvers = {
  CartItem: {
    product: (parent) => parent.Product,
    totalPrice: (parent) => {
      // parent.Product được load từ include trong query
      return parent.Product ? parent.Product.price * parent.quantity : 0;
    },
  },
  Cart: {
    grandTotal: (parent) => {
      // Tính tổng tiền các item có isSelected = true
      if (!parent.CartItems) return 0;
      return parent.CartItems.reduce((total, item) => {
        if (item.isSelected && item.Product) {
          return total + item.Product.price * item.quantity;
        }
        return total;
      }, 0);
    },
    items: (parent) => parent.CartItems, // Map field 'items' của GraphQL sang 'CartItems' của Sequelize
  },

  // Resolvers cho các truy vấn GraphQL và mutations liên quan đến giỏ hàng
  Query: {
    // Lấy giỏ hàng của user hiện tại
    myCart: async (_, __, context) => {
      // context.user được lấy từ middleware xác thực
      if (!context.user) throw new Error("Unauthorized");

      const cart = await Cart.findOne({
        where: { userId: context.user.id, status: "active" },
        include: [
          {
            model: CartItem,
            include: [Product], // Load thông tin sản phẩm kèm theo
          },
        ],
      });
      return cart;
    },
  },

  // Mutations để thao tác với giỏ hàng như thêm, sửa, xóa sản phẩm trong giỏ hàng
  Mutation: {
    // Thêm sản phẩm vào giỏ hàng
    addToCart: async (_, { productId, quantity }, context) => {
      if (!context.user) throw new Error("Unauthorized");
      const cart = await getOrCreateCart(context.user.id);

      // Kiểm tra sản phẩm đã có trong giỏ chưa
      const existingItem = await CartItem.findOne({
        where: { cartId: cart.id, productId },
      });

      if (existingItem) {
        existingItem.quantity += quantity;
        await existingItem.save();
      } else {
        await CartItem.create({
          cartId: cart.id,
          productId,
          quantity,
          isSelected: true, // Mặc định thêm vào là chọn luôn
        });
      }

      // Trả về cart mới nhất để cập nhật UI
      return await Cart.findOne({
        where: { id: cart.id },
        include: [{ model: CartItem, include: [Product] }],
      });
    },

    updateCartItemQuantity: async (_, { cartItemId, quantity }, context) => {
      if (!context.user) throw new Error("Unauthorized");
      if (quantity < 1) throw new Error("Quantity must be at least 1");

      const item = await CartItem.findByPk(cartItemId);
      if (!item) throw new Error("Item not found");

      item.quantity = quantity;
      await item.save();

      return await Cart.findByPk(item.cartId, {
        include: [{ model: CartItem, include: [Product] }],
      });
    },

    toggleCartItemSelection: async (_, { cartItemId, isSelected }, context) => {
      if (!context.user) throw new Error("Unauthorized");

      const item = await CartItem.findByPk(cartItemId);
      if (!item) throw new Error("Item not found");

      item.isSelected = isSelected;
      await item.save();

      return await Cart.findByPk(item.cartId, {
        include: [{ model: CartItem, include: [Product] }],
      });
    },

    selectAllCartItems: async (_, { isSelected }, context) => {
      if (!context.user) throw new Error("Unauthorized");
      const cart = await getOrCreateCart(context.user.id);

      await CartItem.update(
        { isSelected: isSelected },
        { where: { cartId: cart.id } }
      );

      return await Cart.findByPk(cart.id, {
        include: [{ model: CartItem, include: [Product] }],
      });
    },

    removeCartItem: async (_, { cartItemId }, context) => {
      if (!context.user) throw new Error("Unauthorized");

      const item = await CartItem.findByPk(cartItemId);
      if (item) {
        const cartId = item.cartId;
        await item.destroy();
        return await Cart.findByPk(cartId, {
          include: [{ model: CartItem, include: [Product] }],
        });
      }
      return null;
    },

    clearCart: async (_, __, context) => {
      if (!context.user) throw new Error("Unauthorized");
      const cart = await Cart.findOne({
        where: { userId: context.user.id, status: "active" },
      });

      if (cart) {
        await CartItem.destroy({ where: { cartId: cart.id } });
        return true;
      }
      return false;
    },
  },
};

module.exports = resolvers;
