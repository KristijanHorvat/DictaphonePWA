const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Save uploaded files to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, req.body.name + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));

app.post('/upload', upload.fields([{ name: 'name', maxCount: 1 }, { name: 'blob' }]), (req, res) => {
  res.send('File uploaded!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
