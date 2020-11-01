const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoute = require("./routes/userRoute");
const productsRoute = require("./routes/productsRoute");
const ordersRoute = require("./routes/ordersRoute");
const uploadRoute = require('./routes/uploadRoute');


const app = express();
app.use(cors());
const PORT = process.env.PORT || 3200;


const url =
  "mongodb+srv://bahiges:NancyAjram@bahige.xxlki.mongodb.net/productsdb?retryWrites=true&w=majority";

// connect to db.
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .catch((error) => console.log("error: " + JSON.stringify(error.reason)));

const db = mongoose.connection;
db.once("open", () =>
  console.log("Successfully Connected to db on Port " + PORT)
);

app.use(express.json());

app.use("/api/users", userRoute);
app.use("/api/products", productsRoute);
app.use("/api/orders", ordersRoute);

app.use('/api/uploads', uploadRoute);
// static files
app.use('/uploads', express.static('uploads'));



app.listen(PORT, () => {
  console.log("Server Started.");
});
