const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* Import Routes */

const writingRoutes = require("./src/writing/writing.routes");

/* Register Routes */

app.use("/writing", writingRoutes);


/* Test Route */

app.get("/", (req, res) => {
  res.send("Hello Tamil Backend Running");
});


/* Start Server */

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});