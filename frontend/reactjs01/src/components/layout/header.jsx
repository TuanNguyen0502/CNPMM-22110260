import React, { useContext, useState } from "react";
import {
  UsergroupAddOutlined,
  HomeOutlined,
  SettingOutlined,
  ShoppingOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { Menu, Badge } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { useCartContext } from "../context/cart.context";

const Header = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const [current, setCurrent] = useState("home");
  const { cartItems } = useCartContext();

  const onClick = (e) => {
    setCurrent(e.key);
    if (e.key === "logout") {
      localStorage.removeItem("access_token");
      setAuth({
        isAuthenticated: false,
        user: {
          email: "",
          name: "",
          role: "",
        },
      });
      navigate("/");
    }
  };

  const items = [
    {
      label: <Link to={"/"}>Home Page</Link>,
      key: "home",
      icon: <HomeOutlined />,
    },
    ...(auth.isAuthenticated
      ? [
          ...(auth.user.role === "Admin"
            ? [
                {
                  label: <Link to={"/user"}>Users</Link>,
                  key: "user",
                  icon: <UsergroupAddOutlined />,
                },
              ]
            : []),
          {
            label: <Link to={"/products"}>Products</Link>,
            key: "products",
            icon: <ShoppingOutlined />,
          },
          {
            label: <Link to={"/favorites"}>Favorites</Link>,
            key: "favorites",
            icon: <HeartOutlined />,
          },
          {
            label: (
              <Link to={"/cart"}>
                Cart{" "}
                <Badge count={cartItems.length} size="small" offset={[5, 0]} />
              </Link>
            ),
            key: "cart",
            icon: <ShoppingOutlined />,
          },
        ]
      : []),

    {
      label: `Welcome ${auth?.user?.email ?? ""}`,
      key: "SubMenu",
      icon: <SettingOutlined />,
      children: [
        ...(auth.isAuthenticated
          ? [
              {
                label: "Logout",
                key: "logout",
              },
            ]
          : [
              {
                label: <Link to={"/login"}>Login</Link>,
                key: "login",
              },
            ]),
      ],
    },
  ];
  return (
    <Menu
      onClick={onClick}
      selectedKeys={[current]}
      mode="horizontal"
      items={items}
    />
  );
};

export default Header;
