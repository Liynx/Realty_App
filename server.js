
var admin = require("firebase-admin");
var geopoint = require("geopoint");

var serviceAccount = require("./firebase-key.json");

const fileUpload = require('express-fileupload');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://itas255node.firebaseio.com"
});

const db = admin.firestore();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//fileupload npm package needed to upload files to server
app.use(fileUpload({
  //debug : true
}));

app.use(bodyParser.json());


//root connection
app.get('/', function (req, res) {
  console.log("Processing request");

  db.collection('houses').get()
    .then(res2 => {
      let houseArray = [];
      res2.forEach(doc => {
        var houseData = doc.data();
        houseData.id = doc.id;
        houseArray.push(houseData)
        console.log(houseData);

      });

      res.render('index.ejs', { houses: houseArray });

      // Note that res is from express responding to the original request
      console.log("Here is res: ");
      //console.table(res);

      // res2 is the firestore response from Google
      console.log("Here is res2: ");
      //console.table(res2);

    })
    .catch(err => { console.error(err) });

});

app.get('/map', function (req, res) {
  db.collection('houses').get()
    .then(res2 => {
      let houseArray2 = [];
      res2.forEach(doc => {
        houseArray2.push(doc.data())
      });

      res.render('map.ejs', { houses: houseArray2 });
    })
    .catch(err => { console.error(err) });
});

// Route to add a new house
app.post('/add', function (req, res) {
  console.log("Processing request to add a house...");
  //console.log(req.body.address);

  console.log("Trying to create geopoint..");
  //
  usrLat = Number(req.body.lat);
  usrLong = Number(req.body.long);
  //let geop = new geopoint(usrLat, usrLong);

  console.log(req.files);

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  let image = req.files.image;

  name = image.name;

  image.mv(`public/uploads/${name}`, function (err) {
    if (err)
      return res.status(500).send(err);

    //res.send('File uploaded!');
  });

  console.log(req.files.image.name);

  db.collection("houses").doc().set({
    address: req.body.address,
    description: req.body.description,
    price: req.body.price,
    size: req.body.size,
    location: new admin.firestore.GeoPoint(usrLat, usrLong),
    photos: [name]
  })
    .then(function () {
      console.log("Document successfully written!");
      res.redirect('/');

    })
    .catch(function (error) {
      console.error("Error writing document: ", error);
    });

});

app.post('/delete', function (req, res) {
  console.log("Deleting a House");

  const id = req.body.id;

  db.collection('houses').doc(id).delete()
    .then(function () {
      console.log("House Deleted Successfully");
      res.redirect('/');
    })
    .catch(err => { console.error(err) });
});


app.get('/houses', function (req, res) {
  //app.get(‘/houses', (req, res) => {
  console.log("Processing request");
  res.json({ houses: "Here is a sample from the houses route" });

  db.collection('houses').get()
    .then(res => {
      res.forEach(doc => {
        console.log("House: " + doc.id);
        const data = doc.data();
        console.log(data);

        // Example of accessing individual field of the data object:
        console.log("Here is the price: " + data.price);
      });
    })
    .catch(err => { console.error(err) });
});

app.post('/edit', function (req, res) {
  //app.get(‘/houses', (req, res) => {
  //console.log("Processing request");
  const id = req.body.id;
  delete req.body.uid;
  usrLat = Number(req.body.lat);
  usrLong = Number(req.body.long);
  delete req.body.lat;
  delete req.body.long;
  const data = { ...req.body, location: new admin.firestore.GeoPoint(usrLat, usrLong) };

  db.collection("houses").doc(id).update(data);
  res.redirect('/');
  //res.status(200);
  //res.send();

});

app.listen(3000);
console.log("house app: index.js listening on port 3000");