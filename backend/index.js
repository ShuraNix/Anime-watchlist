import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import animeRoutes from './routes/animeRoutes.js';

const app = express();
dotenv.config();

//mideddleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8000',
  'http://127.0.0.1:5500'
];
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.options('*', cors());
app.use(express.json());


//connect to MongoDB
const PORT = process.env.PORT || 8000;
const MONGOURL = process.env.MONGO_URL || 'mongodb://localhost:27017/anime-watchlist';

mongoose.connect(MONGOURL)
.then(() => {
    console.log('Connected to MongoDB');
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
});

//routes
app.use('/api/anime', animeRoutes);

//test route
app.get('/', (req, res) => {
    res.send('Welcome to the Anime Watchlist API');
});

//error handling middleware
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

