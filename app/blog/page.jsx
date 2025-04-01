"use client";

import React, { useState, useEffect } from "react";
import FirstBlog from "@/components/FirstBlog";
import OtherBlogs from "@/components/OtherBlogs";
import { AiOutlineSearch } from "react-icons/ai";
import { useSession } from "next-auth/react";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMyBlogs, setShowMyBlogs] = useState(false);

  const { data: session, status } = useSession();

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
        console.log("Current User ID:", session?.user?._id);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const currentUserId = session?.user?._id;

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

  const applyFilters = () => {
    let result = blogs;
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
    setShowMyBlogs(true);
    applyFilters();
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
    <div>
      {blogs?.length > 0 ? (
        <div className="container">
          <div className="flex flex-col items-center my-10">
            <div className="w-full flex justify-center">
              <h2 className="text-center">
                <span className="text-primaryColor">Trending</span> Blog
              </h2>
            </div>
            <div className="w-full flex justify-between mt-4">
              <div className="flex items-center gap-4">
                <div className="relative w-64">
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
                </div>
                <div className="relative">
                  <button
                    className="px-4 py-2 bg-primaryColor text-white rounded-lg"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    Lọc
                  </button>
                  {isFilterOpen && (
                    <div className="absolute left-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-4 z-10">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center mb-2">
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
                        </div>
                      ))}
                      <div className="flex justify-between mt-4">
                        <button
                          onClick={handleFilter}
                          className="px-4 py-2 bg-primaryColor text-white rounded-lg"
                        >
                          Chọn
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 bg-gray-300 text-black rounded-lg"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={handleMyBlogs}
              >
                Blog của tôi
              </button>
            </div>
          </div>

          <FirstBlog firstBlog={firstBlog} />
          <OtherBlogs otherBlogs={otherBlogs} />
        </div>
      ) : (
        <h3>No Blogs...</h3>
      )}
    </div>
  );
};

export default Blog;