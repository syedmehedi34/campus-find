//! collection name = campus_find

// npx nodemon index.js
// node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://my-campus-find.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());

const uri = `mongodb+srv://${encodeURIComponent(
  process.env.DB_USER,
)}:${encodeURIComponent(
  process.env.DB_PASS,
)}@cluster0.0uhyg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");

    const database = client.db("campus_find");
    const usersCollection = database.collection("users");

    app.get("/", (req, res) => {
      res.send("Campus Find Server is Running");
    });

    //* Save user
    app.post("/users", async (req, res) => {
      try {
        const { userId, email, name, collegeId, photoUrl } = req.body;

        if (!userId || !email || !name) {
          return res.status(400).send({
            success: false,
            message: "Required information is missing",
          });
        }

        const userData = {
          userId,
          email,
          name,
          collegeId: collegeId || null,
          photoUrl: photoUrl || "",
        };

        const result = await usersCollection.updateOne(
          { userId },
          {
            $setOnInsert: {
              ...userData,
              createdAt: new Date(),
              role: "user",
            },
          },
          { upsert: true },
        );

        res.send({
          success: true,
          message: result.upsertedCount
            ? "User created successfully"
            : "User already exists",
        });
      } catch (error) {
        console.error(error);

        res.status(500).send({
          success: false,
          message: "Failed to save user",
        });
      }
    });

    //* Get all users
    app.get("/users", async (req, res) => {
      try {
        const users = await usersCollection.find().toArray();
        res.send(users);
      } catch (error) {
        res.status(500).send({
          message: "Failed to get users",
        });
      }
    });

    //* Get a single user
    app.get("/users/:userId", async (req, res) => {
      try {
        const user = await usersCollection.findOne({
          userId: req.params.userId,
        });

        if (!user) {
          return res.status(404).send({
            message: "User not found",
          });
        }

        res.send(user);
      } catch (error) {
        res.status(500).send({
          message: "Failed to get user",
        });
      }
    });

    //* Update user profile
    app.patch("/users/:userId", async (req, res) => {
      try {
        const { name, collegeId, photoUrl } = req.body;

        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (collegeId !== undefined) updateData.collegeId = collegeId;
        if (photoUrl !== undefined) updateData.photoUrl = photoUrl;

        if (Object.keys(updateData).length === 0) {
          return res.status(400).send({
            message: "No data provided to update",
          });
        }

        const result = await usersCollection.updateOne(
          { userId: req.params.userId },
          { $set: updateData },
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({
            message: "User not found",
          });
        }

        res.send({
          success: true,
          message: "Profile updated successfully",
        });
      } catch (error) {
        console.error(error);

        res.status(500).send({
          success: false,
          message: "Failed to update profile",
        });
      }
    });

    app.listen(port, () => {
      console.log(`Server is running at port: ${port}`);
    });
  } catch (error) {
    console.error("Server error:", error);
  }
}

run();
