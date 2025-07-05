import express from 'express';
import { body, validationResult } from 'express-validator';
import Anime from '../models/anime.js';

const router = express.Router();

// Get all anime with filtering
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};
        const anime = await Anime.find(query).sort({ title: 1 });
        res.json(anime);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new anime with validation
router.post(
  '/',
  [
    body('mal_id').isNumeric(),
    body('title').isString().notEmpty(),
    body('image_url').isURL(),
    body('status').optional().isIn(['watching', 'planned', 'completed'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { mal_id, title, image_url } = req.body;
        
        if (!mal_id || !title || !image_url) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if already exists
        const exists = await Anime.findOne({ mal_id });
        if (exists) {
            return res.status(400).json({ message: 'Anime already in watchlist' });
        }

        const newAnime = new Anime({
            mal_id,
            title,
            image_url,
            status: req.body.status || 'planned'
        });

        await newAnime.save();
        res.status(201).json(newAnime);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update status with validation
router.patch('/:id', async (req, res) => {
    try {
        const validStatuses = ['watching', 'planned', 'completed'];
        if (!validStatuses.includes(req.body.status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updatedAnime = await Anime.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        if (!updatedAnime) {
            return res.status(404).json({ message: 'Anime not found' });
        }

        res.json(updatedAnime);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete anime
router.delete('/:id', async (req, res) => {
    try {
        const deletedAnime = await Anime.findByIdAndDelete(req.params.id);
        if (!deletedAnime) {
            return res.status(404).json({ message: 'Anime not found' });
        }
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;