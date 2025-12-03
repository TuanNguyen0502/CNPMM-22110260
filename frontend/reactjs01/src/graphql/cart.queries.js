import { gql } from "@apollo/client";

export const GET_MY_CART = gql`
  query GetMyCart {
    myCart {
      id
      grandTotal
      items {
        id
        quantity
        isSelected
        totalPrice
        product {
          id
          name
          price
          image
        }
      }
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($productId: ID!, $quantity: Int!) {
    addToCart(productId: $productId, quantity: $quantity) {
      id
      items {
        id
        quantity
      }
    }
  }
`;

export const UPDATE_CART_QUANTITY = gql`
  mutation UpdateQuantity($cartItemId: ID!, $quantity: Int!) {
    updateCartItemQuantity(cartItemId: $cartItemId, quantity: $quantity) {
      id
      grandTotal
    }
  }
`;

export const REMOVE_CART_ITEM = gql`
  mutation RemoveItem($cartItemId: ID!) {
    removeCartItem(cartItemId: $cartItemId) {
      id
    }
  }
`;
