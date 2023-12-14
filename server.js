const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const app = express();
const port = 8080;
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index'); // Zamijenite 'index' s imenom vaše EJS datoteke (bez ekstenzije)
});
/*
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '5432',
  port: 5432, // Change as per your PostgreSQL configuration
});

*/
const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASS,
  port: process.env.PORT,
});

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

app.post('/upload', upload.fields([{ name: 'name', maxCount: 1 }, { name: 'blob' }]), async (req, res) => {
  try {
    const { name, blob } = req.files;

    altFilename= req.body.name;

    const fileBuffer = Buffer.from(blob);

    console.log(altFilename);

    const query = 'INSERT INTO audio_files (name, blob) VALUES ($1, $2)';
    await pool.query(query, [altFilename, fileBuffer]);

    res.status(200).send('File uploaded successfully!');
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
  }
});

app.get('/files', async (req, res) => {
  try {
    console.log("aaaaaaa "+typeof(process.env.PASS));
    const query = 'select * from audio_files where name is not null';
    const result = await pool.query(query);
    
    const files = result.rows;
    
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Error fetching files' });
  }
});
/*pool.query('select * from audio_files where name is not null', (err, res)=>{
  return console.log(res.rows);
})*/
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
