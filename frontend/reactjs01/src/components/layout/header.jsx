import React, { useContext, useState } from "react";
import {
  UsergroupAddOutlined,
  HomeOutlined,
  SettingOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";

const Header = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const [current, setCurrent] = useState("home");

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
