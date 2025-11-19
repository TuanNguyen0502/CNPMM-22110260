// frontend/reactjs01/src/pages/product.jsx
import { notification, Table, Select } from "antd";
import { useEffect, useState } from "react";
import { getProductApi } from "../util/api";

const ProductPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);

  // State cho phân trang và lọc
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    fetchProducts();
  }, [current, pageSize, selectedCategory]); // Gọi lại API khi các state này thay đổi

  const fetchProducts = async () => {
    setLoading(true);
    const res = await getProductApi(current, pageSize, selectedCategory);
    if (res && res.EC === 0) {
      setDataSource(res.data);
      setTotal(res.total);
    } else {
      notification.error({
        message: "Error",
        description: res?.EM || "Lỗi khi tải danh sách sản phẩm",
      });
    }
    setLoading(false);
  };

  // Cột bảng
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Category", dataIndex: "category", key: "category" },
  ];

  // Xử lý khi người dùng bấm phân trang trên Table
  const onChangeTable = (pagination) => {
    if (pagination && pagination.current !== current) {
      setCurrent(pagination.current);
    }
    if (pagination && pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
      setCurrent(1); // Reset về trang 1 khi đổi số lượng item/trang
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Danh sách sản phẩm</h2>

      <div style={{ marginBottom: 20 }}>
        <span>Chọn danh mục: </span>
        <Select
          defaultValue="ALL"
          style={{ width: 150 }}
          onChange={(value) => {
            setSelectedCategory(value);
            setCurrent(1); // Reset về trang 1 khi lọc
          }}
          options={[
            { value: "ALL", label: "Tất cả" },
            { value: "Electronics", label: "Điện tử" },
            { value: "Clothing", label: "Quần áo" },
            { value: "Books", label: "Sách" },
          ]}
        />
      </div>

      <Table
        loading={loading}
        bordered
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
        pagination={{
          current: current,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
        }}
        onChange={onChangeTable}
      />
    </div>
  );
};

export default ProductPage;
