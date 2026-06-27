const express = require('express');
const app = express()
const cors = require('cors');
const port = 5000
require('dotenv').config();

app.use(cors())
app.use(express.json())
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.get('/', (req, res) => {
  res.send('Hello World!')
})



const uri = process.env.MONGO_DB_URI;

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
    await client.connect();

    const database = client.db("startupforge");
    const startupCollection = database.collection("startupCollection");
    const opportunitiesCollection = database.collection("opportunities");
    const applicationsCollection = database.collection("applications");


    // startup
    app.get('/api/myStartup/:email', async (req, res) => {
      const { email } = req.params;
      const result = await startupCollection.findOne({founderEmail: email})
      res.send(result);
    })

    app.get('/api/myStartup', async (req, res) => {
      const result = await startupCollection.find().toArray();
      res.send(result);
    })

    app.post('/api/myStartup', async (req, res) => {
      const startUp = req.body
      const result = await startupCollection.insertOne(startUp);
      res.send(result);
    })

    // opportunity

    app.post('/api/addOpportunity', async (req, res) => {
      const opportunity = req.body;
      const result = await opportunitiesCollection.insertOne(opportunity)
      res.send(result);
    })

      app.get('/api/addOpportunity/:startupId', async (req, res) => {
        const { startupId } = req.params;
        console.log(startupId, "Received Id");
        const result = await opportunitiesCollection.find({ startupId }).toArray();
        console.log(result, "result");
        res.send(result);
      })
    
    app.get('/api/browseOpportunities', async (req, res) => {
      const result = await opportunitiesCollection.find().toArray();
      res.send(result)
    })

    app.patch('/api/addOpportunity/:id', async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
      const result = await opportunitiesCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...updateData,
          },
        }
      )
      res.send(result);
    })

    app.delete('/api/addOpportunity/:id', async (req, res) => {
      const { id } = req.params;
      const result = await opportunitiesCollection.deleteOne({ _id: new ObjectId(id) })
      res.send(result)
    })

    // applications

    app.post('/api/applications', async (req, res) => {
      const data = req.body;
      const result = await applicationsCollection.insertOne({
        ...data,
        status: "pending",
        createdAt: new Date(),
      })
      res.send(result);
    })

    app.get('/api/applications/users/:applicantId', async (req, res) => {
      const { applicantId } = req.params;
      const result = await applicationsCollection.find({ applicantId }).toArray();
      res.send(result);
    })

    // app.patch('/api/myStartup/:id', async (req, res) => {
    //   const startUp = req.body
    //   const result = await startupCollection.updateOne({
    //     _id: new ObjectId(id)
    //   },
    //     {
    //       $set: {
    //         startUp,
    //       }
    //     }
    //   );
    //   res.send(result);
    // })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})