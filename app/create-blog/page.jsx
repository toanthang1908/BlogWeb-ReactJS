"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Input from "@/components/Input";
import TextArea from "@/components/TextArea";
import Image from "next/image";
import { useRouter } from "next/navigation";

const initialState = {
  title: "",
  description: "",
  excerpt: "",
  quote: "",
  category: "Education",
  photo: "",
};

const CreateBlog = () => {
  const CLOUD_NAME = "dn6dk04pp";
  const UPLOAD_PRESET = "nextjs_blog_images";

  const [state, setState] = useState(initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [apiKey, setApiKey] = useState(null);
  const [usedImageUrls, setUsedImageUrls] = useState([]); // Lưu trữ các link ảnh đã sử dụng

  const [chatSize, setChatSize] = useState({ width: 320, height: 400 });
  const chatRef = useRef(null);
  const chatEndRef = useRef(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  const dragState = useRef({ isDragging: false, edge: null, startX: 0, startY: 0, startWidth: 0, startHeight: 0 });

  // Link ảnh mặc định mới (đã kiểm tra và hợp lệ)
  const defaultImageUrl = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"; // Hình ảnh về học trực tuyến

  useEffect(() => {
    setIsChatOpen(true);
    const fetchApiKey = async () => {
      try {
        const res = await fetch("/api/get-api-key");
        const data = await res.json();
        if (data.apiKey) {
          setApiKey(data.apiKey);
          console.log("API Key đã được lấy:", data.apiKey.slice(0, 10) + "...");
          setChatHistory([
            {
              role: "assistant",
              content: "Xin chào! Tôi là trợ lý AI. Bạn muốn viết blog về chủ đề gì? Hãy nhắn tin để trò chuyện nhé!",
            },
          ]);
        } else {
          console.error("Không lấy được API Key:", data.error);
          setChatHistory([
            { role: "assistant", content: "Lỗi: Không thể lấy API Key." },
          ]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy API Key:", error);
        setChatHistory([
          { role: "assistant", content: "Lỗi: Không thể kết nối để lấy API Key." },
        ]);
      }
    };
    fetchApiKey();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleMouseDown = (e, edge) => {
    dragState.current = {
      isDragging: true,
      edge,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: chatSize.width,
      startHeight: chatSize.height,
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragState.current.isDragging) return;

    const { edge, startX, startY, startWidth, startHeight } = dragState.current;
    let newWidth = startWidth;
    let newHeight = startHeight;

    if (edge === "right") {
      newWidth = startWidth + (e.clientX - startX);
    } else if (edge === "left") {
      newWidth = startWidth - (e.clientX - startX);
    } else if (edge === "bottom") {
      newHeight = startHeight + (e.clientY - startY);
    } else if (edge === "top") {
      newHeight = startHeight - (e.clientY - startY);
    }

    newWidth = Math.max(300, Math.min(newWidth, window.innerWidth * 0.8));
    newHeight = Math.max(300, Math.min(newHeight, window.innerHeight * 0.8));

    setChatSize({ width: newWidth, height: newHeight });
  };

  const handleMouseUp = () => {
    dragState.current.isDragging = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Hàm kiểm tra link ảnh có hợp lệ không
  const checkImageUrl = async (url) => {
    try {
      const response = await fetch(url, { method: "GET" });
      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("image")) {
        return url;
      }
      return null; // Trả về null nếu link không hợp lệ
    } catch (error) {
      console.error("Lỗi khi kiểm tra link ảnh:", error);
      return null;
    }
  };

  if (status === "loading") {
    return <p>đang tải...</p>;
  }

  if (status === "unauthenticated") {
    return <p>Quyền truy cập bị từ chối</p>;
  }

  const handleChange = (event) => {
    setError("");
    const { name, value, type, files } = event.target;
    if (type === "file") {
      setState({ ...state, [name]: files[0] });
    } else {
      setState({ ...state, [name]: value });
    }
  };

  const handleChatInputChange = (event) => {
    setChatInput(event.target.value);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey) {
      setChatHistory([
        ...chatHistory,
        { role: "assistant", content: "Lỗi: API Key chưa sẵn sàng. Vui lòng thử lại sau!" },
      ]);
      return;
    }

    if (!chatInput.trim()) {
      setChatHistory([
        ...chatHistory,
        { role: "assistant", content: "Vui lòng nhập tin nhắn để trò chuyện!" },
      ]);
      return;
    }

    const userMessage = { role: "user", content: chatInput };
    setChatHistory([...chatHistory, userMessage]);
    setChatInput("");
    setIsAILoading(true);

    let aiContent = "";
    let validImageUrl = null;
    let attempts = 0;
    const maxAttempts = 3; // Số lần thử tối đa để tìm link ảnh hợp lệ

    while (attempts < maxAttempts) {
      try {
        console.log("API Key được sử dụng:", apiKey.slice(0, 10) + "...");
        console.log("Gửi yêu cầu đến Groq API với category:", state.category);
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [
              {
                role: "system",
                content:
                  `Bạn là một trợ lý viết blog. Trò chuyện với người dùng để hiểu rõ yêu cầu của họ. Khi người dùng yêu cầu tạo nội dung blog, hãy tạo nội dung theo định dạng:\n\nTiêu đề: [title]\n\nMiêu tả: [description]\n\nTrích đoạn: [excerpt]\n\nTrích dẫn: [quote]\n\nHình ảnh: [image_url]\n\nĐảm bảo các nhãn (Tiêu đề, Miêu tả, Trích đoạn, Trích dẫn, Hình ảnh) phải bằng tiếng Việt và mỗi nhãn bắt đầu bằng một dòng mới (cách nhau bằng hai ký tự xuống dòng). Hình ảnh phải là một URL hợp lệ dẫn đến hình ảnh thực sự tồn tại, liên quan trực tiếp đến nội dung blog, từ nguồn miễn phí như Unsplash hoặc Pexels. Ví dụ: nếu blog nói về "học trực tuyến", hình ảnh phải liên quan đến học tập trực tuyến (máy tính, sách, học sinh học online, v.v.), như https://images.unsplash.com/photo-1600585154340-be6161a56a0c; nếu blog nói về "sống tối giản", hình ảnh phải liên quan đến lối sống tối giản (nhà cửa gọn gàng, ít đồ đạc, v.v.), như https://images.pexels.com/photos/2905861/pexels-photo-2905861.jpeg. Đảm bảo link hình ảnh không dẫn đến lỗi 404 và không trùng với các link đã sử dụng trước đó trong phiên chat, danh sách các link đã sử dụng: ${usedImageUrls.join(", ")}. Nếu người dùng chỉ trò chuyện thông thường, hãy trả lời tự nhiên và hữu ích.`,
              },
              ...chatHistory,
              userMessage,
              ...(attempts > 0
                ? [
                    {
                      role: "assistant",
                      content: "Link ảnh trước đó không hợp lệ hoặc không liên quan. Vui lòng cung cấp một link ảnh mới, hợp lệ, liên quan đến nội dung blog, và không trùng với các link đã sử dụng.",
                    },
                  ]
                : []),
            ],
            max_tokens: 400,
            temperature: 0.7,
          }),
        });

        console.log("Phản hồi từ API:", response.status, response.statusText);
        if (!response.ok) {
          const errorText = await response.text();
          console.log("Chi tiết lỗi từ API:", errorText);
          throw new Error(`Lỗi khi gọi API Groq: ${response.status} - ${errorText || response.statusText}`);
        }

        const data = await response.json();
        console.log("Dữ liệu từ API:", data);

        aiContent = data.choices[0].message.content;
        console.log("Nội dung AI trả về:", aiContent);

        // Kiểm tra và lấy link ảnh
        if (aiContent.includes("Hình ảnh:")) {
          const lines = aiContent.split("\n");
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith("Hình ảnh:")) {
              let url = lines[i].replace("Hình ảnh: ", "").trim();
              validImageUrl = await checkImageUrl(url);
              if (validImageUrl && !usedImageUrls.includes(validImageUrl)) {
                lines[i] = `Hình ảnh: ${validImageUrl}`;
                setUsedImageUrls([...usedImageUrls, validImageUrl]);
                aiContent = lines.join("\n");
                break; // Thoát vòng lặp nếu tìm được link hợp lệ
              } else {
                attempts++;
                if (attempts === maxAttempts) {
                  // Nếu đã thử đủ số lần mà vẫn không được, dùng link mặc định
                  validImageUrl = defaultImageUrl;
                  if (!usedImageUrls.includes(validImageUrl)) {
                    setUsedImageUrls([...usedImageUrls, validImageUrl]);
                  }
                  lines[i] = `Hình ảnh: ${validImageUrl}`;
                  aiContent = lines.join("\n");
                }
                break; // Thoát vòng lặp để thử lại
              }
            }
          }
          if (validImageUrl) break; // Thoát vòng lặp while nếu đã tìm được link hợp lệ
        } else {
          break; // Thoát vòng lặp nếu không có dòng Hình ảnh
        }
      } catch (error) {
        console.error("Lỗi khi gọi Groq API từ chat:", error);
        setChatHistory([
          ...chatHistory,
          userMessage,
          { role: "assistant", content: `Có lỗi xảy ra: ${error.message}. Vui lòng thử lại hoặc kiểm tra API Key!` },
        ]);
        setIsAILoading(false);
        return;
      }
    }

    setChatHistory([...chatHistory, userMessage, { role: "assistant", content: aiContent }]);

    // Tự động điền vào ô Input nếu AI trả về nội dung blog
    if (
      aiContent.includes("Tiêu đề:") &&
      aiContent.includes("Miêu tả:") &&
      aiContent.includes("Trích đoạn:") &&
      aiContent.includes("Trích dẫn:")
    ) {
      const lines = aiContent.split("\n").filter((line) => line.trim());
      const contentMap = {};
      lines.forEach((line) => {
        const [key, value] = line.split(": ");
        if (key && value) contentMap[key] = value;
      });

      const newState = {
        ...state,
        title: contentMap["Tiêu đề"] || "Blog hay từ AI",
        description: contentMap["Miêu tả"] || "Một bài blog thú vị được tạo bởi AI.",
        excerpt: contentMap["Trích đoạn"] || "Tóm tắt blog từ AI.",
        quote: contentMap["Trích dẫn"] || `"Viết blog dễ dàng với AI."`,
      };

      console.log("Điền nội dung vào ô Input:", newState); // Log để debug
      setState(newState);
    }

    setIsAILoading(false);
  };

  const renderMessageContent = (content) => {
    if (content.includes("Hình ảnh:")) {
      const lines = content.split("\n");
      return lines.map((line, index) => {
        if (line.startsWith("Hình ảnh:")) {
          const url = line.replace("Hình ảnh: ", "").trim();
          return (
            <div key={index}>
              Hình ảnh: <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{url}</a>
            </div>
          );
        }
        return <div key={index}>{line}</div>;
      });
    }
    return content;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { photo, title, category, description, excerpt, quote } = state;

    if (!title || !description || !category || !excerpt || !quote) {
      setError("Vui lòng điền vào tất cả các trường hợp.");
      return;
    }

    if (photo) {
      const maxSize = 5 * 1024 * 1024;
      if (photo.size > maxSize) {
        setError("Dung lượng file quá lớn. Hãy chọn file dưới 5MB.");
        return;
      }
    }

    if (title.length < 4) {
      setError("Tiêu đề phải dài ít nhất 4 ký tự.");
      return;
    }

    if (description.length < 20) {
      setError("Miêu tả phải dài ít nhất 20 ký tự.");
      return;
    }

    if (excerpt.length < 10) {
      setError("Trích đoạn phải dài ít nhất 10 ký tự.");
      return;
    }

    if (quote.length < 6) {
      setError("Trích dẫn phải dài ít nhất 6 ký tự.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");
      const image = await uploadImage();

      const newBlog = {
        title,
        description,
        excerpt,
        quote,
        category,
        image,
        authorId: session?.user?._id,
      };

      const response = await fetch("http://localhost:3000/api/blog", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        method: "POST",
        body: JSON.stringify(newBlog),
      });

      if (response?.status === 201) {
        setSuccess("Blog đã tạo thành công.");
        setTimeout(() => {
          router.refresh();
          router.push("/blog");
        }, 1500);
      } else {
        setError("Đã xảy ra lỗi khi tạo blog.");
      }
    } catch (error) {
      console.log(error);
      setError("Đã xảy ra lỗi khi tạo blog.");
    }

    setIsLoading(false);
  };

  const uploadImage = async () => {
    if (!state.photo) return;

    const formdata = new FormData();
    formdata.append("file", state.photo);
    formdata.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
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
  };

  return (
    <section className="container max-w-3xl relative">
      <h2 className="mb-5">
        <span className="special-word">Tạo</span> Blog
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
          <label className="block mb-2 text-sm font-medium">
            Upload hình ảnh
          </label>
          <input
            onChange={handleChange}
            type="file"
            name="photo"
            accept="image/*"
          />
          {state.photo && (
            <div>
              <Image
                src={URL.createObjectURL(state.photo)}
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

        {error && <div className="text-red-700">{error}</div>}
        {success && <div className="text-green-700">{success}</div>}

        <div className="flex gap-4">
          <button
            type="submit"
            className="btn"
            disabled={isLoading || isAILoading}
          >
            {isLoading ? "Đang tải..." : "Tạo"}
          </button>
        </div>
      </form>

      {isChatOpen && (
        <div
          ref={chatRef}
          className="fixed bottom-5 right-5 bg-white shadow-lg rounded-lg z-50 overflow-hidden"
          style={{ width: `${chatSize.width}px`, height: `${chatSize.height}px` }}
        >
          <div
            className="absolute top-0 left-0 w-2 h-full cursor-ew-resize bg-transparent hover:bg-gray-200"
            onMouseDown={(e) => handleMouseDown(e, "left")}
          />
          <div
            className="absolute top-0 right-0 w-2 h-full cursor-ew-resize bg-transparent hover:bg-gray-200"
            onMouseDown={(e) => handleMouseDown(e, "right")}
          />
          <div
            className="absolute top-0 left-0 w-full h-2 cursor-ns-resize bg-transparent hover:bg-gray-200"
            onMouseDown={(e) => handleMouseDown(e, "top")}
          />
          <div
            className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize bg-transparent hover:bg-gray-200"
            onMouseDown={(e) => handleMouseDown(e, "bottom")}
          />

          <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold">Trợ lý AI</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsChatOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto mb-2 p-2 bg-gray-100 rounded">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <span
                    className={`inline-block p-2 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    {renderMessageContent(message.content)}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={handleChatInputChange}
                placeholder="Nhắn tin với AI..."
                className="w-full p-2 border rounded text-black"
                disabled={isAILoading}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={isAILoading}
              >
                {isAILoading ? "..." : "Gửi"}
              </button>
            </form>
          </div>
        </div>
      )}
      {!isChatOpen && (
        <button
          className="fixed bottom-5 right-5 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600"
          onClick={() => setIsChatOpen(true)}
        >
          💬
        </button>
      )}
    </section>
  );
};

export default CreateBlog;