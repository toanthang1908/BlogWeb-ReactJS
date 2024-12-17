import mongoose from 'mongoose';

export async function connect() {
    try {
        mongoose.connect(process.env.MONGODB_URL);
        const connection = mongoose.connection;

        connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        })

        connection.on('error', (err) => {
            console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
            process.exit();
        })

    } catch (error) {
        console.log('Something goes wrong!');
        console.log(error);
        
    }
}

//Đoạn mã bạn đưa ra là một hàm kết nối với cơ sở dữ liệu MongoDB bằng cách sử dụng Mongoose trong môi trường Node.js.
//  Hàm connect() này sẽ kết nối tới MongoDB thông qua biến môi trường MONGODB_URL, 
//  sau đó quản lý các sự kiện kết nối để xử lý thành công hoặc lỗi trong quá trình kết nối.