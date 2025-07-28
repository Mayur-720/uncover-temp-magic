const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./configs/dbConnect');
const socketConfig = require('./configs/socket');
const http = require('http');
const Tag = require('./models/tagModel');

dotenv.config();

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const circleRoutes = require('./routes/circleRoutes');
const ghostCircleRoutes = require('./routes/ghostCircleRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes');
const collegeRoutes = require('./routes/collegeRoutes');
const areaRoutes = require('./routes/areaRoutes');
const tagRoutes = require('./routes/tagRoutes');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/circles', circleRoutes);
app.use('/api/ghost-circles', ghostCircleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/tags', tagRoutes);

// Initialize predefined tags
const initializeTags = async () => {
  try {
    await Tag.initializePredefinedTags();
  } catch (error) {
    console.error('Error initializing tags:', error);
  }
};

// Connect to database and initialize tags
connectDB().then(() => {
  initializeTags();
});

socketConfig(server);

const PORT = process.env.PORT || 8900;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
