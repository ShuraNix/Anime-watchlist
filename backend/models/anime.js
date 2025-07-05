import mongoose from 'mongoose';

const AnimeSchema = new mongoose.Schema({
  mal_id: Number,
  title: String,
  image_url: String,
  status: {
    type: String,
    enum: ['watching', 'planned', 'completed'],
    default: 'planned'
  }
});

export default mongoose.model('Anime', AnimeSchema);
