const typeDefs = `#graphql
  type Product {
    id: ID!
    name: String!
    price: Int!
    category: String
    image: String
  }

  type CartItem {
    id: ID!
    product: Product
    quantity: Int!
    isSelected: Boolean!
    totalPrice: Int # Field tính toán (price * quantity)
  }

  type Cart {
    id: ID!
    items: [CartItem]
    grandTotal: Int # Tổng tiền các món được chọn
  }

  type Query {
    # Xem giỏ hàng hiện tại của user đang đăng nhập
    myCart: Cart
  }

  type Mutation {
    # Thêm sản phẩm vào giỏ
    addToCart(productId: ID!, quantity: Int!): Cart

    # Sửa số lượng
    updateCartItemQuantity(cartItemId: ID!, quantity: Int!): Cart

    # Chọn/Bỏ chọn sản phẩm để thanh toán (01 hoặc nhiều)
    toggleCartItemSelection(cartItemId: ID!, isSelected: Boolean!): Cart
    
    # Chọn tất cả hoặc bỏ chọn tất cả
    selectAllCartItems(isSelected: Boolean!): Cart

    # Xóa 1 sản phẩm khỏi giỏ
    removeCartItem(cartItemId: ID!): Cart

    # Xóa toàn bộ giỏ hàng
    clearCart: Boolean
  }
`;

module.exports = typeDefs;
