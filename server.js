const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const fs = require('fs');

const app = express();
const port = 8080;
app.use(cors());
// Set 'views' directory to 'public/views'
app.set('views', path.join(__dirname, 'public', 'views'));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

//app.set('view engine', 'ejs');
//app.use(express.static('public'));
const audioDirectory = 'uploads/'; 

app.use(bodyParser.json());
 app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index'); // Zamijenite 'index' s imenom vaše EJS datoteke (bez ekstenzije)
});
app.get('/uploads', (req, res) => {
  res.render('uploads'); // Zamijenite 'index' s imenom vaše EJS datoteke (bez ekstenzije)
});
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '5432',
  port: 5432, // Change as per your PostgreSQL configuration
});

/*
const pool = new Pool({
  user: 'postgres_db_qgmw_user',
  host: 'dpg-cl0f72is1bgc73a12mm0-a',
  database: 'postgres_db_qgmw',
  password: 'U0GUQNQ4jwkKm8Xmx28ldyrd3B06df73',
  port: 5432,
});
*/

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, req.body.name)
  }
})

const upload = multer({ storage: storage })

app.use(express.static('public'));
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

app.post('/upload', upload.fields([{ name: 'name', maxCount: 1 }, { name: 'blob' }]), async (req, res) => {
  try {
    const { name, blob } = req.files;
/*
    altFilename= req.body.name;

    const fileBuffer = Buffer.from(blob);

    console.log("alt filename "+altFilename+ " file buffer: " + fileBuffer);
    console.log("json stringify: "+JSON.stringify(req.body))

    const query = 'INSERT INTO audio_files (name, blob) VALUES ($1, $2)';
    await pool.query(query, [altFilename, fileBuffer]);
*/
    res.status(200).send('File uploaded successfully!');
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
  }
});

app.get('/files', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT name FROM audio_files where name is not null');
    const files = result.rows.map(row => row.name);
    client.release();

    console.log(files);
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).send('Error fetching files');
  }
});

// Endpoint to serve audio Blob data by file name
app.get('/file/:file_name', async (req, res) => {
  const fileName = req.params.file_name;

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT blob FROM audio_files WHERE name = $1', [fileName]);
   
    if (result.rows.length === 0 || !result.rows[0].blob) {
      client.release();
      return res.status(404).send('File not found');
    }

    
    const audioBlob = result.rows[0].blob;
    const blob = new Blob();
    blob.text(audioBlob)
  .then(text => {
    console.log(text); // Ovdje imate pristup konvertovanom tekstu iz Blob-a
  })
  .catch(error => {
    console.error('Error occurred:', error);
  });

    // Send the Blob data as a response
    res.set('Content-Type', 'audio/wav'); // Adjust content type based on file type
    res.send(audioBlob);
    client.release();
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).send('Error fetching file');
  }
});
/*pool.query('select * from audio_files where name is not null', (err, res)=>{
  return console.log(res.rows);
})*/

const uploadDir = path.join(__dirname, 'uploads'); // Path to your uploads directory

app.get('/audioList', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      res.status(500).json({ error: 'Error reading audio files' });
      return;
    }

    const wavFiles = files.filter(file => {
      return path.extname(file).toLowerCase() === '.wav';
    });

    res.json(wavFiles);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
