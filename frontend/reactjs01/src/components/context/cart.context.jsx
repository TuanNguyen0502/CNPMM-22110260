import { createContext, useContext } from "react";
import { useCart } from "@tuantp2004/my-shop-cart";

export const CartContext = createContext(null);

export const CartWrapper = ({ children }) => {
  // Sử dụng hook logic từ thư viện
  const cartLogic = useCart([]);

  return (
    <CartContext.Provider value={cartLogic}>{children}</CartContext.Provider>
  );
};

// Custom hook để các component con gọi cho nhanh
export const useCartContext = () => {
  return useContext(CartContext);
};
