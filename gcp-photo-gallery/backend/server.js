const express = require('express');
const cors = require('cors');
const multer = require('multer');
const multerS3 = require('multer-s3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { S3Client } = require('@aws-sdk/client-s3');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-digital-ocean';

// --- KẾT NỐI DIGITAL OCEAN SPACES (Storage) ---
const s3Client = new S3Client({
    endpoint: process.env.DO_SPACES_ENDPOINT, // VD: "https://sgp1.digitaloceanspaces.com"
    forcePathStyle: false,
    region: process.env.DO_SPACES_REGION || "sgp1",
    credentials: {
      accessKeyId: process.env.DO_SPACES_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET
    }
});

const upload = multer({
    storage: multerS3({
      s3: s3Client,
      bucket: process.env.DO_SPACES_BUCKET,
      acl: 'public-read',
      key: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
      }
    })
});

// --- KẾT NỐI DIGITAL OCEAN MONGODB (Database) ---
let db;
const mongoClient = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
    try {
        await mongoClient.connect();
        db = mongoClient.db("photo_gallery"); // Tên database
        console.log("✅ Đã kết nối cơ sở dữ liệu MongoDB !");
    } catch (error) {
        console.error("❌ Lỗi kết nối MongoDB:", error);
    }
}
connectDB();

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).send({ message: 'Không có quyền truy cập.' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send({ message: 'Token không hợp lệ.' });
        req.user = user;
        next();
    });
};

// --- API: Đăng ký ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const existing = await db.collection('users').findOne({ username });
        if (existing) return res.status(400).send({ message: 'Tên người dùng đã tồn tại.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.collection('users').insertOne({
            username,
            password: hashedPassword,
            createdAt: new Date()
        });
        res.status(200).send({ message: 'Đăng ký thành công!' });
    } catch (error) {
        res.status(500).send({ message: 'Lỗi đăng ký', error: error.message });
    }
});

// --- API: Đăng nhập ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await db.collection('users').findOne({ username });
        
        if (!user) return res.status(400).send({ message: 'Tài khoản không tồn tại.' });
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).send({ message: 'Sai mật khẩu.' });

        const token = jwt.sign({ id: user._id.toString(), username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).send({ token, username: user.username });
    } catch (error) {
        res.status(500).send({ message: 'Lỗi đăng nhập', error: error.message });
    }
});

// --- API: Tải file lên DO Spaces ---
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
    // Multer-s3 đã đẩy ảnh thẳng lên DO Spaces và ném link công khai vào req.file.location
    if (!req.file) return res.status(400).send('Vui lòng chọn ảnh.');
    res.status(200).send({ url: req.file.location });
});

// --- API: Lưu thông tin bức ảnh vào Database ---
app.post('/api/photos', authenticateToken, async (req, res) => {
    try {
        const { title, description, imageUrl, date } = req.body;
        
        const newPhoto = {
            userId: req.user.id,
            title: title || 'Kỷ niệm',
            description: description || '',
            imageUrl: imageUrl,
            date: new Date(date),
            createdAt: new Date()
        };

        const result = await db.collection('photos').insertOne(newPhoto);
        res.status(200).send({ message: 'Lưu ảnh thành công!', id: result.insertedId });
    } catch (error) {
        res.status(500).send({ message: 'Lỗi lưu thông tin', error: error.message });
    }
});

// --- API: Lấy danh sách ảnh ---
app.get('/api/photos', authenticateToken, async (req, res) => {
    try {
        const photos = await db.collection('photos')
                               .find({ userId: req.user.id })
                               .sort({ date: -1 })
                               .toArray();
        
        // Đổi _id của mongo thành id cho frontend dễ xài
        const formattedPhotos = photos.map(photo => ({
            id: photo._id.toString(),
            title: photo.title,
            description: photo.description,
            imageUrl: photo.imageUrl,
            date: photo.date,
            createdAt: photo.createdAt
        }));

        res.status(200).send(formattedPhotos);
    } catch (error) {
        res.status(500).send({ message: 'Lỗi lấy dữ liệu', error: error.message });
    }
});

// --- API: Xóa ảnh ---
app.delete('/api/photos/:id', authenticateToken, async (req, res) => {
    try {
        const photoId = req.params.id;
        
        // Kiểm tra xem ảnh hợp lệ và thuộc về người dùng hiện tại không
        const photo = await db.collection('photos').findOne({ 
            _id: new ObjectId(photoId),
            userId: req.user.id
        });

        if (!photo) {
            return res.status(404).send({ message: 'Không tìm thấy ảnh hoặc bạn không có quyền xóa.' });
        }

        // Tùy chọn: Xóa ảnh khỏi S3/DO Spaces ở đây nếu cần thiết trong tương lai
        // ...

        // Xóa thông tin ảnh khỏi Database
        await db.collection('photos').deleteOne({ _id: new ObjectId(photoId) });
        
        res.status(200).send({ message: 'Xóa ảnh thành công.' });
    } catch (error) {
        res.status(500).send({ message: 'Lỗi xóa ảnh', error: error.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server đang chạy tại port ${PORT}`);
});
