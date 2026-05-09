require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(error.message);
    console.error("Create backend/.env and set MONGO_URI + JWT_SECRET, then restart.");
    process.exit(1);
  });
