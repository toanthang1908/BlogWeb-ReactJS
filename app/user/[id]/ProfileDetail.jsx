"use client"

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {signOut, useSession} from "next-auth/react";
import Image from "next/image";
import moment from "moment";
import Modal from "@/components/Model";
import {deletePhoto} from "@/actions/uploadActions";
import Input from "@/components/Input";
import demo_image from "@/public/img/demo_image.jpg";
import { AiOutlineClose } from "react-icons/ai";


const ProfileDetail = ({profile, params}) => {
    const CLOUD_NAME="dn6dk04pp";
    const UPLOAD_PRESET="nextjs_blog_images";

    const [profileToEdit, setProfileToEdit] = useState(profile);
    const [avatarToEdit, setAvatarToEdit] = useState("");

    const [openModalEdit, setOpenModalEdit] = useState(true);
    const [openModalDelete, setOpenModalDelete] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [isDeleting, setIsDeleting] = useState(false);

    const { data: session, status } = useSession();
    const router = useRouter();

    const handleEditSubmit = async(e) => {
        e.preventDefault();
        setError("");

        const {name, about, designation, age ,location} = profileToEdit;

        if(!name) {
        setError("Cần nhập tên");
        return;
    }

    if(avatarToEdit) {
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if(avatarToEdit.size > maxSize) {
        setError('Dung lượng file quá lớn. Hãy chọn file dưới 2MB.');
        return;
      }
    }
    
    try{
      setIsLoading(true);
      setError("");
      setSuccess("");

    let profileImg;

    if(avatarToEdit) {
        profileImg = await uploadImage();

        if(profile?.avatar?.id) {
            await deletePhoto(profile?.avatar?.id);

        }
    } else {
        profileImg= profile?.avatar;
    }

      const updateUser = {
        name,
        about, 
        designation, 
        age ,
        location,
        avatar: profileImg
      };

      const response = await fetch(`http://localhost:3000/api/user/${params.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
          method: "PATCH",
          body: JSON.stringify(updateUser),
        }
      )

      if(response?.status === 200) {
        setSuccess("Người dùng đã cập nhật thành công.");
      } else {
        setError("Đã xảy ra lỗi khi cập nhật người dùng.")
      }
    } catch(error) {
      console.log(error);
      setError("Đã xảy ra lỗi khi cập nhật người dùng.")
    } finally {
        setSuccess("");
        setError("");
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

    const timeFormat = () => {
        const timeStr = profile?.createdAt;
        const time = moment(timeStr);
        const formattedTime = time.format("DD-MM-YYYY");

        return formattedTime;
    };

    const handleCancleUploadImage = () => {
        setAvatarToEdit("")
    }

    const handleChange = (event) =>  {
        setError("");
        const { name, value, type, files } = event.target;
    
        if (type === "file") {
          setAvatarToEdit(files[0]);
        } else {
          setProfileToEdit(preState => ({...preState, [name]: value}))
        }
      };

    if (!profile) {
        return <p>Truy cập bị từ chối</p>
    }

    return (
        <div className="p-3 my-5">
            <div className="text-center text-primaryColor pb-20">
                <h2>Profile</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1 space-y-3">
                    <h4 className="text-xl">Giới thiệu bản thân</h4>
                    <p>{profile?.about}</p>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                    <Image 
                        src={profile?.avatar?.url || demo_image} 
                        alt="avatar" 
                        width={0} 
                        height={0} 
                        sizes="100vw" 
                        className="w-80 h-80 rounded-full border-2 border-black"
                    />
                </div>

                <div className="flex-1 space-y-3">
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
                        <p>{profile?.age}</p>
                    </div>

                    <div className="space-y-1">
                        <p>Địa chỉ:</p>
                        <p>{profile?.location}</p>
                    </div>

                    <div className="space-y-1">
                        <p>Thời gian lập tài khoản:</p>
                        <p>{timeFormat()}</p>
                    </div>

                    <div className="space-y-1">
                        <button 
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                            onClick={() => router.push("/change-password")}>
                            Thay đổi mật khẩu
                        </button>
                    </div>


                </div>
            </div>

            <div className="pt-5">
                {profile?.id === session?.user?._id && (
                <button 
                    className="text-primaryColor mr-3"
                    onClick={() => setOpenModalEdit(true)}
                    >Chỉnh sửa 
                </button>
                )}
                
                <Modal modalOpen={openModalEdit} setModalOpen={setOpenModalEdit}>
                    <form className="w-full space-y-3" onSubmit={handleEditSubmit}>
                        <h2 className="text-2xl text-primaryColor pb-3">Hồ sơ</h2>

                        {avatarToEdit ? (
                            <div className="flex justify-center items-start">
                                <Image
                                    src={URL.createObjectURL(avatarToEdit)}
                                    alt="avatar"
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    className="w-20 h-20 rounded-full border-2 border-black"
                                />

                                <button className="text-red-500" onClick={handleCancleUploadImage}>
                                    <AiOutlineClose/>
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                {profile?.avatar && profile?.avatar['url'] && (
                                    <div>
                                        <Image
                                            src={profile?.avatar?.url}
                                            alt="avatar"
                                            width={0}
                                            height={0}
                                            sizes="100vw"
                                            className="w-20 h-20 rounded-full border-2 border-black"
                                />
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                        <input
                            onChange={handleChange} 
                            type="file" 
                            name="newImage" 
                            accept="image/*"
                            className="block w-full border border-gray-300 rounded-lg"
                        />
                        </div>
                        <Input
                            name="name"
                            type="text"
                            placeholder="Tên"
                            value={profileToEdit?.name || ""}
                            onChange={handleChange}
                        />

                        <Input
                            name="designation"
                            type="text"
                            placeholder="Công việc"
                            value={profileToEdit?.designation || ""}
                            onChange={handleChange}
                        />

                        <Input
                            name="about"
                            type="text"
                            placeholder="Giới thiệu"
                            value={profileToEdit?.about || ""}
                            onChange={handleChange}
                        />

                        <Input
                            name="age"
                            type="text"
                            placeholder="Tuổi"
                            value={profileToEdit?.age || ""}
                            onChange={handleChange}
                        />

                        <Input
                            name="location"
                            type="text"
                            placeholder="Địa chỉ"
                            value={profileToEdit?.location || ""}
                            onChange={handleChange}
                         />

                        {error && <div className="text-red-700">{error}</div>}

                        {success && <div className="text-green-700">{success}</div>}

                        <div className="space-x-5">
                            <button type="submit" className="btn">
                                {isLoading ? "Đang tải..." : "Cập nhật"}
                            </button>

                            <button className="btn bg-red-700" onClick={() =>
                            setOpenModalEdit(false)}>
                                Hủy bỏ
                            </button>
                            
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    )
}

export default ProfileDetail