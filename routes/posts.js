const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { verifyToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// Get all posts
// Get all posts with pagination
router.get('/', async (req, res) => {
  try {
    let { page = 1, limit = 9 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const totalPosts = await Post.countDocuments();
    const posts = await Post.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      posts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


// Get single
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username email');
    if (!post) return res.status(404).json({ msg: 'Not found' });
    res.json(post);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Create (admin only) - allow image upload (field name: image)
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const newPost = new Post({ title, content, imageUrl, author: req.user.id });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Update (admin only) - allow replacing image
router.put('/:id', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Not found' });
    post.title = req.body.title ?? post.title;
    post.content = req.body.content ?? post.content;
    if (req.file){
      const oldImagePath = path.join(__dirname, '..', post.imageUrl);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.log('Old image delete error:', err);
        });
      post.imageUrl = `/uploads/${req.file.filename}`;
    }
      
    await post.save();
    res.json(post);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Delete (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;
