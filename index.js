const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6ogtg9l.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toyCollection = client.db('toyVerseDB').collection('toys')
    const toyAddCollection = client.db('toyVerseDB').collection('addToys')




    // toys 
    app.get('/toys/:text', async (req, res) => {
      if (req.params.text == 'Animated_character' || req.params.text == 'Disney_princess' || req.params.text == 'Frozen_dolls') {

        const result = await toyCollection.find({ subCategory: req.params.text }).toArray()
        return res.send(result)
      }


      const result = await toyCollection.find({}).toArray()

      res.send(result)
    })

    app.get('/toysDetail/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query)
      res.send(result)
    })


    // addToys
    app.post('/addToys', async (req, res) => {
      const addToys = req.body
      const result = await toyAddCollection.insertOne(addToys)
      res.send(result)
    })

    // search by toy name


    app.get('/toySearchByName/:text', async (req, res) => {
      
      const indexKeys = { Toy_Name: 1, SubCategory: 1 }
      const indexOption = { name: 'Toy_NameSubCategory' }
      const ok = await toyAddCollection.createIndex(indexKeys, indexOption)

      const searchText = req.params.text
      const result = await toyAddCollection.find({
        $or: [
          { Toy_Name: { $regex: searchText, $options: 'i' } },
          { SubCategory: { $regex: searchText, $options: 'i' } }
        ]
      }).toArray()
      res.send(result)
    })

    // all toys
    app.get('/allToys', async (req, res) => {
      const limit = parseInt(req.query.limit) || 20
      const result = await toyAddCollection.find().limit(limit).toArray()
      res.send(result)
    })

    // myToys
    app.get('/myToys/:email', async (req, res) => {
      const sort = req.query.sort

      const options = {
        sort: { "Price": sort === 'asc' ? 1 : -1}
      }
      const result = await toyAddCollection.find({ Seller_Email: req.params.email }, options).toArray()
      res.send(result)
    })

    // viewDetail 
    app.get('/viewToys/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await toyAddCollection.findOne(query)
      res.send(result)
    })

    app.put('/update/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updatedToy = req.body
      const option = { upsert: true }
      const toy = {
        $set: {
          Toy_Name: updatedToy.Toy_Name,
          Seller_Name: updatedToy.Seller_Name,
          Seller_Email: updatedToy.Seller_Email,
          SubCategory: updatedToy.SubCategory,
          Ratting: updatedToy.Ratting,
          Price: updatedToy.Price,
          Url: updatedToy.Url,
          Available_Quantity: updatedToy.Available_Quantity,
          description: updatedToy.description,
        }
      }

      const result = await toyAddCollection.updateOne(filter, toy, option)
      res.send(result)
    })

    app.delete('/Toys/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await toyAddCollection.deleteOne(query)
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('my assignment eleven is doing good')
})

app.listen(port, () => {
  console.log(`My toy verse is running On port : ${port}`)
})




