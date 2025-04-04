"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import moment from "moment";
import Modal from "@/components/Model";
import { deletePhoto } from "@/actions/uploadActions";
import Input from "@/components/Input";
import demo_image from "@/public/img/demo_image.jpg";
import { AiOutlineClose } from "react-icons/ai";
import { motion } from "framer-motion";

// Variants cho hiệu ứng
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

const ProfileDetail = ({ profile, params }) => {
  const CLOUD_NAME = "dn6dk04pp";
  const UPLOAD_PRESET = "nextjs_blog_images";

  const [profileToEdit, setProfileToEdit] = useState(profile);
  const [avatarToEdit, setAvatarToEdit] = useState("");
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [blogCount, setBlogCount] = useState(0);

  const { data: session, status } = useSession();
  const router = useRouter();

  // Lấy và lọc số bài viết của người dùng hiện tại
  useEffect(() => {
    const fetchBlogCount = async () => {
      try {
        // Gọi API mà không thêm query userId nếu API chưa hỗ trợ
        const res = await fetch(`http://localhost:3000/api/blog`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Không thể lấy dữ liệu blog");
        }
        const blogs = await res.json();
        console.log("All blogs:", blogs); // Debug tất cả blog

        // Lọc blog theo authorId khớp với params.id
        const userBlogs = blogs.filter((blog) => {
          const authorId = blog.authorId?._id || blog.authorId; // Xử lý cả trường hợp authorId là object hoặc string
          return authorId === params.id;
        });
        console.log("Filtered user blogs:", userBlogs); // Debug blog của người dùng
        setBlogCount(userBlogs.length);
      } catch (error) {
        console.error("Lỗi khi lấy số bài viết:", error);
        setBlogCount(0);
      }
    };
    if (params.id) {
      fetchBlogCount();
    }
  }, [params.id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { name, about, designation, age, location } = profileToEdit;

    if (!name) {
      setError("Cần nhập tên");
      return;
    }

    if (avatarToEdit) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (avatarToEdit.size > maxSize) {
        setError("Dung lượng file quá lớn. Hãy chọn file dưới 5MB.");
        return;
      }
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      let profileImg = avatarToEdit ? await uploadImage() : profile?.avatar;

      if (avatarToEdit && profile?.avatar?.id) {
        await deletePhoto(profile?.avatar?.id);
      }

      const updateUser = {
        name,
        about,
        designation,
        age,
        location,
        avatar: profileImg,
      };

      const response = await fetch(`http://localhost:3000/api/user/${params.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        method: "PATCH",
        body: JSON.stringify(updateUser),
      });

      if (response?.status === 200) {
        setSuccess("Người dùng đã cập nhật thành công.");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Đã xảy ra lỗi khi cập nhật người dùng.");
      }
    } catch (error) {
      console.log(error);
      setError("Đã xảy ra lỗi khi cập nhật người dùng.");
    } finally {
      setIsLoading(false);
      setOpenModalEdit(false);
      setAvatarToEdit("");
      router.refresh();
    }
  };

  const uploadImage = async () => {
    if (!avatarToEdit) return;

    const formdata = new FormData();
    formdata.append("file", avatarToEdit);
    formdata.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formdata,
      });
      const data = await res.json();
      return { id: data["public_id"], url: data["secure_url"] };
    } catch (error) {
      console.log(error);
    }
  };

  const timeFormat = () => {
    return moment(profile?.createdAt).format("DD-MM-YYYY");
  };

  const handleCancelUploadImage = () => {
    setAvatarToEdit("");
  };

  const handleChange = (event) => {
    setError("");
    const { name, value, type, files } = event.target;
    if (type === "file") {
      setAvatarToEdit(files[0]);
    } else {
      setProfileToEdit((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (!profile) {
    return <p>Truy cập bị từ chối</p>;
  }

  return (
    <motion.div
      className="p-3 my-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="text-center text-primaryColor pb-20" variants={itemVariants}>
        <h2>Profile</h2>
      </motion.div>

      <motion.div className="flex flex-col md:flex-row gap-5" variants={containerVariants}>
        <motion.div className="flex-1 space-y-3" variants={itemVariants}>
          <h4 className="text-xl">Giới thiệu bản thân</h4>
          <p>{profile?.about || "Chưa có giới thiệu."}</p>
        </motion.div>

        <motion.div
          className="flex-1 flex items-center justify-center"
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(0,0,0,0.2)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Image
            src={profile?.avatar?.url || demo_image}
            alt="avatar"
            width={0}
            height={0}
            sizes="100vw"
            className="w-80 h-80 rounded-full border-2 border-black"
          />
        </motion.div>

        <motion.div className="flex-1 space-y-3" variants={itemVariants}>
          <h4 className="text-xl">Chi tiết</h4>
          <div className="space-y-1">
            <p>Email:</p>
            <p>{profile?.email}</p>
          </div>
          <div className="space-y-1">
            <p>Tên:</p>
            <p>{profile?.name}</p>
          </div>
          <div className="space-y-1">
            <p>Tuổi:</p>
            <p>{profile?.age || "Chưa cập nhật"}</p>
          </div>
          <div className="space-y-1">
            <p>Địa chỉ:</p>
            <p>{profile?.location || "Chưa cập nhật"}</p>
          </div>
          <div className="space-y-1">
            <p>Số bài blog:</p>
            <p>{blogCount}</p>
          </div>
          <div className="space-y-1">
            <p>Ngày tham gia:</p>
            <p>{timeFormat()}</p>
          </div>
          <div className="space-x-3">
            <motion.button
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              whileHover={{ scale: 1.05, backgroundColor: "#2563eb" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/change-password")}
            >
              Thay đổi mật khẩu
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <motion.div className="pt-5" variants={itemVariants}>
        {profile?.id === session?.user?._id && (
          <motion.button
            className="text-primaryColor mr-3"
            whileHover={{ scale: 1.1, color: "#1e40af" }}
            onClick={() => setOpenModalEdit(true)}
          >
            Chỉnh sửa
          </motion.button>
        )}

        <Modal modalOpen={openModalEdit} setModalOpen={setOpenModalEdit}>
          <motion.form
            className="w-full space-y-3"
            onSubmit={handleEditSubmit}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <h2 className="text-2xl text-primaryColor pb-3">Hồ sơ</h2>

            {avatarToEdit ? (
              <motion.div className="flex justify-center items-start" variants={itemVariants}>
                <Image
                  src={URL.createObjectURL(avatarToEdit)}
                  alt="avatar"
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-20 h-20 rounded-full border-2 border-black"
                />
                <motion.button
                  className="text-red-500"
                  onClick={handleCancelUploadImage}
                  whileHover={{ scale: 1.2 }}
                >
                  <AiOutlineClose />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div className="flex justify-center" variants={itemVariants}>
                {profile?.avatar?.url && (
                  <Image
                    src={profile?.avatar?.url}
                    alt="avatar"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-20 h-20 rounded-full border-2 border-black"
                  />
                )}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <input
                onChange={handleChange}
                type="file"
                name="newImage"
                accept="image/*"
                className="block w-full border border-gray-300 rounded-lg"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Input
                name="name"
                type="text"
                placeholder="Tên"
                value={profileToEdit?.name || ""}
                onChange={handleChange}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Input
                name="designation"
                type="text"
                placeholder="Công việc"
                value={profileToEdit?.designation || ""}
                onChange={handleChange}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Input
                name="about"
                type="text"
                placeholder="Giới thiệu"
                value={profileToEdit?.about || ""}
                onChange={handleChange}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Input
                name="age"
                type="text"
                placeholder="Tuổi"
                value={profileToEdit?.age || ""}
                onChange={handleChange}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Input
                name="location"
                type="text"
                placeholder="Địa chỉ"
                value={profileToEdit?.location || ""}
                onChange={handleChange}
              />
            </motion.div>

            {error && (
              <motion.div className="text-red-700" variants={itemVariants}>
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div className="text-green-700" variants={itemVariants}>
                {success}
              </motion.div>
            )}

            <motion.div className="space-x-5" variants={itemVariants}>
              <motion.button
                type="submit"
                className="btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path d="M4 12a8 8 0 018-8" fill="none" stroke="currentColor" strokeWidth="4" />
                    </svg>
                    Đang tải...
                  </span>
                ) : (
                  "Cập nhật"
                )}
              </motion.button>
              <motion.button
                className="btn bg-red-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpenModalEdit(false)}
              >
                Hủy bỏ
              </motion.button>
            </motion.div>
          </motion.form>
        </Modal>
      </motion.div>
    </motion.div>
  );
};

export default ProfileDetail;