const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const multer = require('multer');
// const convertToMongoFormat = require('./convetToMongo');
const app = express();
const port = 6890;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
const uri = 'mongodb+srv://yardandb:yardan12345@cluster0.tuwcw4h.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  },
});

async function connectDB() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
connectDB().catch(console.dir);

async function displayData(res, searchFilter) {
  try {
    const database = client.db('qualityair');
    const collection = database.collection('data_angin');

    let query = {};

    if (searchFilter) {
      query = {
        $or: [
          { time: { $regex: `.*${searchFilter}.*`, $options: 'i' } },
          { AMB_TEMP: { $regex: `.*${searchFilter}.*`, $options: 'i' } },
          { station: { $regex: `.*${searchFilter}.*`, $options: 'i' } },
          { CH4: { $regex: `.*${searchFilter}.*`, $options: 'i' } },
          { CO: { $regex: `.*${searchFilter}.*`, $options: 'i' } },
          { NMHC: { $regex: `.*${searchFilter}.*`, $options: 'i' } },
          { NO: { $regex: `.*${searchFilter}.*`, $options: 'i' } },
          { NOx: { $regex: `.*${searchFilter}.*`, $options: 'i' } },
          { O3: { $regex: `.*${searchFilter}.*`, $options: 'i' } },
          // Tambahkan kolom lain yang ingin Anda cari
        ],
      };
    }

    const cursor = collection.find(query);
    const data = await cursor.toArray();

    res.render('index', { data, searchFilter });
  } catch (error) {
    console.error('Error displaying data', error);
    res.status(500).send('Internal Server Error');
  }
}

app.get('/search', async (req, res) => {
  const searchFilter = req.query.q;

  await connectDB();
  await displayData(res, searchFilter);
});

app.post('/delete/:id', async (req, res) => {
  try {
    const database = client.db('qualityair');
    const collection = database.collection('data_angin');

    const id = req.params.id;

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    console.log(`Deleted data with ID: ${id}`, result);

    res.redirect('/');
  } catch (error) {
    console.error('Error deleting data', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/update/:id', async (req, res) => {
  try {
    const database = client.db('qualityair');
    const collection = database.collection('data_angin');

    const id = req.params.id;
    const result = await collection.findOne({ _id: new ObjectId(id) });

    res.render('update', { data: result });
  } catch (error) {
    console.error('Error rendering update page', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/update/:id', async (req, res) => {
  try {
    const database = client.db('qualityair');
    const collection = database.collection('data_angin');

    const id = req.params.id;
    const newData = {
      time: req.body.time,
      station: req.body.station,
      AMB_TEMP: req.body.AMB_TEMP,
      CH4: req.body.CH4,
      CO: req.body.CO,
      NMHC: req.body.NMHC,
      NO: req.body.NO,
      NOx: req.body.NOx,
      O3: req.body.O3,
    };

    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: newData });
    console.log(`Updated data with ID: ${id}`, result);

    res.redirect('/');
  } catch (error) {
    console.error('Error updating data', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/create', async (req, res) => {
  res.render('create');
});

app.post('/create', async (req, res) => {
  try {
    const database = client.db('qualityair');
    const collection = database.collection('data_angin');
    const newData = {
      time: req.body.time,
      station: req.body.station,
      AMB_TEMP: req.body.AMB_TEMP,
      CH4: req.body.CH4,
      CO: req.body.CO,
      NMHC: req.body.NMHC,
      NO: req.body.NO,
      NO2: req.body.NO2,
      NOx: req.body.NOx,
      O3: req.body.O3,
    };

    const result = await collection.insertOne(newData);
    console.log(`Inserted new data with ID: ${result.insertedId}`);
    res.redirect('/');
  } catch (error) {
    console.error('Error creating data', error);
    res.status(500).send('Internal Server Error');
  }
});

// const storage = multer.memoryStorage(); // Use memory storage for handling file buffer
// const upload = multer({ storage: storage });

// // Route for rendering the update form
// app.get('/addBulk', async (req, res) => {
//   res.render('addBulk');
// });
// // Route to handle adding data from XLSX to MongoDB
// app.post('/addBulk', upload.single('file'), async (req, res) => {
//   try {
//     const database = client.db('qualityair');
//     const collection = database.collection('data_angin');
//     if (!req.file) {
//       return res.json({ message: 'No file uploaded!' });
//     }
//     const dataToAdd = convertToMongoFormat(req.file.buffer); // Example: Modify as needed
//     // Check if data is empty
//     if (!dataToAdd || dataToAdd.length === 0) {
//       return res.json({ message: 'No data to insert!' });
//     }
//     const result = await collection.insertMany(dataToAdd);
//     if (result.insertedCount > 0) {
//       res.json({ message: 'Data added to MongoDB from XLSX!' });
//     } else {
//       res.json({ message: 'No data added to MongoDB!' });
//     }
//   } catch (error) {
//     console.error('Error adding data to MongoDB from XLSX:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Set up storage for uploaded files
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); // Destination directory
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname); // Use a unique filename
//   },
// });

// const upload = multer({ 
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // Adjust the file size limit as needed
// });
// app.get('/upload', async (req, res) => {
//   res.render('addBulk');
// });
// // Handle file upload
// app.post('/upload', upload.single('file'), (req, res) => {
//   // req.file contains the uploaded file
//   const fileBuffer = req.file.buffer;
//   // Call your function to convert Excel data to MongoDB format
//   const mongoData = convertToMongoFormat(fileBuffer);
//   if (mongoData.length === 0) {
//     console.log('No data to insert into MongoDB.');
//     return res.status(400).send('No data to insert into MongoDB.');
//   }
//   // Perform MongoDB operations or save the data as needed
//   const database = client.db('qualityair');
//   const collection = database.collection('data_angin');
//   // Insert data into MongoDB
//   collection
//     .insertMany(mongoData)
//     .then((result) => {
//       console.log('Data inserted into MongoDB');
//       res.send('File uploaded successfully!');
//     })
//     .catch((error) => {
//       console.error('Error inserting data into MongoDB', error);
//       res.status(500).send('Internal Server Error');
//     });
// });

app.get('/', async (req, res) => {
  const searchFilter = req.query.q;

  await connectDB();
  await displayData(res, searchFilter);
});

function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
