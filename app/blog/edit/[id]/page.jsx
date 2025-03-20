"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Input from "@/components/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TextArea from "@/components/TextArea";
import demoimage from "@/public/img/demo_image.jpg";
import Image from 'next/image'
import  {deletePhoto} from "@/actions/uploadActions";

const initialState = {
  title: "",
  description: "",
  excerpt: "",
  quote: "",
  category: "Education",
  photo: {},
  blogId: "",
  newImage: "",
};

const EditBlog = ({params}) => {

  const CLOUD_NAME="dn6dk04pp";
  const UPLOAD_PRESET="nextjs_blog_images";

  const [state, setState] = useState(initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
console.log(state)
  const router = useRouter();
  const {data: session, status} = useSession();

  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await fetch(`http://localhost:3000/api/blog/${params.id}`);

        if (res.status === 200) {
          const blogData = await res.json();

          setState((prevstate) => ({
            ...prevstate,
            title: blogData.title,
            description: blogData.description,
            excerpt: blogData.excerpt,
            quote: blogData.quote,
            category: blogData.category,
            photo: blogData.image,
            blogId: blogData._id,
          }));
        } else {
          setError("Lỗi khi tìm nạp dữ liệu blog");
        }
      } catch (error) {
        setError("Lỗi khi tìm nạp dữ liệu blog");
      }
    }

    fetchBlog();

  }, [params.id]);


  if(status === "loading") {
    return <p>đang tải...</p>
  }

  if(status === "unauthenticated") {
    return <p>Quyền truy cập bị từ chối</p>
  }

  const handleChange = (event) =>  {
    setError("");
    const { name, value, type, files } = event.target;

    if (type === "file") {
      setState({ ...state, [name]: files[0] });
    } else {
      setState({ ...state, [name]: value });
    }
  };

    const handleSubmit = async(e) => {
        e.preventDefault();

        const {newImage, title, category, description, excerpt, quote} = state;

        if(!title || !description || !category || !excerpt || !quote) {
        setError("Vui lòng điền vào tất cả các trường hợp.");
        return;
    }

    if(newImage) {
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if(newImage.size > maxSize) {
        setError('Dung lượng file quá lớn. Hãy chọn file dưới 5MB.');
        return;
      }
    }

    if (title.length < 4) {
      setError("Tiêu đề phải dài ít nhát 4 ký tự.");
      return;
    }

    if (description.length < 20) {
      setError("Miêu tả phải dài ít nhất 20 ký tự.");
      return;
    }

    if (excerpt.length < 10) {
      setError("Trích đoạn phải dài ít nhất 4 ký tự.");
      return;
    }

    if (quote.length < 6) {
      setError("Trích dẫn phải dài ít nhất 6 ký tự.");
      return;
    }
    
    try{
      setIsLoading(true);
      setError("");
      setSuccess("");

    let image;

    if(state.newImage) {
        image = await uploadImage();

        if(state.photo?.id) {
            await deletePhoto(state.photo.id)

        }
    } else {
        image= state.photo;
    }

      const updateBlog = {
        title,
        description,
        excerpt,
        quote,
        category,
        image,
        authorId: session?.user?._id,
      }

      const response = await fetch(`http://localhost:3000/api/blog/${params.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
          method: "PUT",
          body: JSON.stringify(updateBlog),
        }
      )

      if(response?.status === 200) {
        setSuccess("Blog đã cập nhật thành công.");
        setTimeout(() => {
          router.refresh();
          router.push(`/blog/${params.id}`);
        }, 1500); 
      } else {
        setError("Đã xảy ra lỗi khi cập nhật blog.")
      }
    } catch(error) {
      console.log(error);
      setError("Đã xảy ra lỗi khi cập nhật blog.")
    }

    setIsLoading(false)
  }

  const uploadImage = async () => {
    if (!state.newImage) return;

    const formdata = new FormData();

    formdata.append("file", state.newImage);
    formdata.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formdata,
        }
      );
      const data = await res.json();
      const image = {
        id: data["public_id"],
        url: data["secure_url"],
      };

      return image;
    } catch (error) {
      console.log(error);
    }
  }

  const handleCancleUploadImg = () => {
    setState({ ...state, ["newImage"]: "" });
  }

  return (
    <section className="container max-w-3xl">
      <h2 className="mb-5">
        <span className="special-word">Edit</span> Blog
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Tiêu đề"
          type="text"
          name="title"
          placeholder="Viết tiêu đề tại đây..."
          onChange={handleChange}
          value={state.title}
        />

        <TextArea
          label="Miêu tả"
          rows="4"
          name="description"
          placeholder="Viết miêu tả tại đây..."
          onChange={handleChange}
          value={state.description}
        />

        <TextArea
          label="Trích đoạn"
          rows="2"
          name="excerpt"
          placeholder="Viết trích đoạn blog tại đây..."
          onChange={handleChange}
          value={state.excerpt}
        />

        <TextArea
          label="Trích dẫn"
          rows="2"
          name="quote"
          placeholder="Viết trích dẫn tại đây..."
          onChange={handleChange}
          value={state.quote}
        />

        <div>
          <label className="block">Chọn một loại</label>
          <select
            name="category"
            onChange={handleChange}
            value={state.category}
            className="block rounded-lg w-full p-3 bg-primaryColorLight"
          >
            <option value="Technology">Technology</option>
            <option value="Education">Education</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Politics">Politics</option>
            <option value="Sports">Sports</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Upload hình ảnh</label>

          <input
            onChange={handleChange} 
            type="file" 
            name="newImage" 
            accept="image/*"
          />

          {state.newImage ? (
            <div>
              <Image
                src={URL.createObjectURL(state.newImage)}
                priority
                alt="Sample image"
                width={0}
                height={0}
                sizes="100vw"
                className="w-32 mt-5"
              />

              <button onClick={handleCancleUploadImg}>Cancle</button>
            </div>
          ) : (

            <div>
              {state.photo && state.photo["url"] && (
                <div>
                  <Image
                    src={state.photo.url}
                    priority
                    alt="Sample image"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-32 mt-5"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {error && <div className="text-red-700">{error}</div>}

        {success && <div className="text-green-700">{success}</div>}

        <button type="submit" className="btn">
          {isLoading ? "Đang tải..." : "Chỉnh sửa"}
        </button>
      </form>
    </section>
  );
};

export default EditBlog;
