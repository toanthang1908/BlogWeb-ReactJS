import React from 'react'
import ProfileDetail from './ProfileDetail'

async function getUserData(params) {
    const res = await fetch(`http://localhost:3000/api/user/${params.id}`, {
      cache: "no-store",
    });
  
    if (!res.ok) {
      throw new Error("không thể tìm nạp dữ liệu");
    }
  
    return res.json();
  }
  

const UserProfile = async ({params}) => {
    const profile = await getUserData(params)
    return (
        <div>
            <ProfileDetail profile={profile} params={params} />
        </div>
    )
}

export default UserProfile