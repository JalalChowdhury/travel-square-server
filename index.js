const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

// WHEN DELETE ELEMENT ,THAN USE THIS ID
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ug0c1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



console.log(uri);

//main 
async function run() {

    try {
        await client.connect();

        const databae = client.db('travel-square-data');
        const servicesCollection = databae.collection('services');
        const ordersCollection = databae.collection('orders');
        const reviewsCollection = databae.collection('reviews');

        // GET Services API
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();


            res.send(services);
        })

        // GET ORDER API
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();


            res.send(orders);
        })


        // GET user API
        app.get('/userOrders', (req, res) => {
            const queryEmail = req.query.email;
            ordersCollection.find({ userEmail: queryEmail })
                .toArray((err, userOrders) => {
                    res.send(userOrders);
                })
        })

        // GET REVIEWS API
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();


            res.send(reviews);
        })


        //FOR SINGLE USER INFO
        app.get('/services/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const service = await servicesCollection.findOne(query);
            console.log('load service with id: ', id);

            res.send(service);

        })


        // POST API
        app.post('/services', async (req, res) => {

            const newService = req.body;
            const result = await servicesCollection.insertOne(newService);

            console.log("got new User", req.body);
            console.log("added user", result);

            res.json(result);


        })
        //POST API FOR ORDER
        app.post('/addOrder', async (req, res) => {

            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder);

            console.log("got new User", req.body);
            console.log("added user", result);

            res.json(result);


        })

        //UPDATE STATUS

        app.patch('/updateOrderStatus', (req, res) => {
            // console.log(req.body);
            ordersCollection.updateOne({ _id: ObjectId(req.body.orderId) },
                {
                    $set: { status: req.body.status }
                })
                .then(result => {
                    // console.log(result);
                    res.send(result.modifiedCount > 0);
                })
        })

        // Delete order 
        app.delete("/cancelOrder/:id", (req, res) => {
            ordersCollection.deleteOne({ _id: ObjectId(req.params.id) })
                .then(result => {
                    // console.log(result.deletedCount)
                    res.send(result.deletedCount > 0);

                })
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);










app.get('/', (req, res) => {
    res.send("Runing Travel square server");
});

app.listen(port, () => {
    console.log("Running server porttt ", port)
})