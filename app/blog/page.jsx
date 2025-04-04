"use client";

import React, { useState, useEffect } from "react";
import FirstBlog from "@/components/FirstBlog";
import OtherBlogs from "@/components/OtherBlogs";
import { AiOutlineSearch } from "react-icons/ai";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

// CSS inline
const styles = `
  .hover-scale:hover {
    transition: transform 0.3s ease;
  }
  .skeleton-pulse {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: pulse 1.5s infinite;
  }
  @keyframes pulse {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMyBlogs, setShowMyBlogs] = useState(false);

  const { data: session, status } = useSession();
  const currentUserId = session?.user?._id;

  // Định nghĩa applyFilters trước useEffect
  const applyFilters = () => {
    let result = [...blogs]; // Sao chép mảng gốc để tránh thay đổi trực tiếp
    if (showMyBlogs && currentUserId) {
      result = result.filter((blog) => {
        const authorId = blog.authorId?._id || blog.authorId;
        const isMatch = authorId === currentUserId;
        console.log(`Blog author: ${authorId}, Current user: ${currentUserId}, Match: ${isMatch}`);
        return isMatch;
      });
    }
    if (selectedCategories.length > 0) {
      result = result.filter((blog) => selectedCategories.includes(blog.category));
    }
    if (searchQuery) {
      result = result.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredBlogs(result);
    console.log("Filtered blogs:", result);
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/blog", {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Không thể tìm nạp dữ liệu");
        }
        const data = await res.json();
        setBlogs(data);
        setFilteredBlogs(data);
        console.log("Dữ liệu blog:", data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    // Áp dụng lọc khi showMyBlogs, blogs, selectedCategories hoặc searchQuery thay đổi
    applyFilters();
  }, [showMyBlogs, blogs, selectedCategories, searchQuery]);

  if (isLoading) {
    return (
      <div className="container my-10">
        <motion.div
          className="h-10 w-1/2 skeleton-pulse mx-auto mb-5 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="h-40 skeleton-pulse rounded-lg"
              variants={itemVariants}
            />
          ))}
        </motion.div>
      </div>
    );
  }

  const categories = [...new Set(blogs?.map((blog) => blog.category))];
  const firstBlog = filteredBlogs && filteredBlogs[0];
  const otherBlogs = filteredBlogs?.length > 0 && filteredBlogs.slice(1);

  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((cat) => cat !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleFilter = () => {
    applyFilters();
    setIsFilterOpen(false);
  };

  const handleSearchClick = () => {
    applyFilters();
  };

  const handleCancel = () => {
    setSelectedCategories([]);
    setSearchQuery("");
    setShowMyBlogs(false);
    setFilteredBlogs(blogs);
    setIsFilterOpen(false);
  };

  const handleMyBlogs = () => {
    if (status === "unauthenticated") {
      alert("Vui lòng đăng nhập để xem blog của bạn!");
      return;
    }
    setShowMyBlogs((prev) => !prev); // Toggle trạng thái
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div>
        {blogs?.length > 0 ? (
          <div className="container">
            <motion.div
              className="flex flex-col items-center my-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="w-full flex justify-center" variants={itemVariants}>
                <h2 className="text-center">
                  <span className="text-primaryColor">Trending</span> Blog
                </h2>
              </motion.div>
              <motion.p className="mt-2" variants={itemVariants}>
                Khám phá những bài viết hot nhất từ cộng đồng BlogVip!
              </motion.p>
              <motion.div className="w-full flex justify-between mt-4" variants={itemVariants}>
                <div className="flex items-center gap-4">
                  <motion.div
                    className="relative w-64"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearch}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Tìm kiếm blog..."
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor pr-10 text-black"
                    />
                    <AiOutlineSearch
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                      size={20}
                      onClick={handleSearchClick}
                    />
                  </motion.div>
                  <div className="relative">
                    <motion.button
                      className="px-4 py-2 bg-primaryColor text-white rounded-lg"
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                      Lọc
                    </motion.button>
                    {isFilterOpen && (
                      <motion.div
                        className="absolute left-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-4 z-10"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        {categories.map((category) => (
                          <motion.div
                            key={category}
                            className="flex items-center mb-2"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <input
                              type="checkbox"
                              id={category}
                              name={category}
                              value={category}
                              checked={selectedCategories.includes(category)}
                              onChange={() => handleCategoryChange(category)}
                              className="mr-2"
                            />
                            <label htmlFor={category}>{category}</label>
                          </motion.div>
                        ))}
                        <div className="flex justify-between mt-4">
                          <motion.button
                            onClick={handleFilter}
                            className="px-4 py-2 bg-primaryColor text-white rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Chọn
                          </motion.button>
                          <motion.button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-300 text-black rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Đặt lại
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
                <motion.button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMyBlogs}
                >
                  Blog của tôi
                </motion.button>
              </motion.div>
              {showMyBlogs && (
                <motion.p
                  className="mt-2 text-sm text-gray-500"
                  variants={itemVariants}
                >
                  Đang xem: Blog của tôi
                </motion.p>
              )}
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <FirstBlog firstBlog={firstBlog} />
              <OtherBlogs otherBlogs={otherBlogs} />
            </motion.div>
          </div>
        ) : (
          <motion.h3
            className="text-center my-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No Blogs...
          </motion.h3>
        )}
      </div>
    </>
  );
};

export default Blog;