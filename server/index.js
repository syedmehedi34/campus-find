// ! Database = campus_find
// ! Collections = users, items

// npx nodemon index.js
// node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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

// Allowed values
const ITEM_TYPES = ["lost", "found"];

const CATEGORIES = [
  "electronics",
  "gadgets",
  "accessories",
  "stationery",
  "books",
  "clothing",
  "footwear",
  "id-cards",
  "wallets-purses",
  "keys",
  "other",
];

const POST_STATUSES = ["active", "cancelled", "resolved"];

// Validate MongoDB ObjectId
const isValidId = (id) => ObjectId.isValid(id);

//! Main Function
async function run() {
  try {
    await client.connect();

    console.log("MongoDB connected successfully!");

    const database = client.db("campus_find");

    const usersCollection = database.collection("users");
    const itemsCollection = database.collection("items");

    // Create indexes
    await itemsCollection.createIndex({
      universityCode: 1,
      type: 1,
      postStatus: 1,
      createdAt: -1,
    });

    await itemsCollection.createIndex({
      userId: 1,
      createdAt: -1,
    });

    app.get("/", (req, res) => {
      res.send("Campus Find Server is Running");
    });

    // =====================================
    //              USER CRUD
    // =====================================

    //! Save User
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

    //! Get All Users
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

    //! Get Single User
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

    //! Update User - Dynamic PATCH
    app.patch("/users/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        if (!userId) {
          return res.status(400).send({
            success: false,
            message: "User ID is required",
          });
        }

        // Frontend থেকে পাঠানো সব data নেওয়া হচ্ছে
        const updateData = { ...req.body };

        // গুরুত্বপূর্ণ field সরাসরি update করা যাবে না
        const protectedFields = ["_id", "userId", "createdAt", "updatedAt"];

        protectedFields.forEach((field) => {
          delete updateData[field];
        });

        // MongoDB operator বা nested key injection আটকানো
        Object.keys(updateData).forEach((key) => {
          if (key.startsWith("$") || key.includes(".")) {
            delete updateData[key];
          }
        });

        // Role validation
        if (
          updateData.role !== undefined &&
          !["user", "admin"].includes(updateData.role)
        ) {
          return res.status(400).send({
            success: false,
            message: "Invalid user role",
          });
        }

        if (Object.keys(updateData).length === 0) {
          return res.status(400).send({
            success: false,
            message: "No valid data provided to update",
          });
        }

        updateData.updatedAt = new Date();

        const result = await usersCollection.updateOne(
          { userId },
          {
            $set: updateData,
          },
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "User not found",
          });
        }

        res.send({
          success: true,
          message: "User updated successfully",
          modifiedCount: result.modifiedCount,
          updatedData: updateData,
        });
      } catch (error) {
        console.error("Update user error:", error);

        res.status(500).send({
          success: false,
          message: "Failed to update user",
          error: error.message,
        });
      }
    });

    //! Delete User
    app.delete("/users/:userId", async (req, res) => {
      try {
        const result = await usersCollection.deleteOne({
          userId: req.params.userId,
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "User not found",
          });
        }

        res.send({
          success: true,
          message: "User deleted successfully",
        });
      } catch (error) {
        console.error(error);

        res.status(500).send({
          success: false,
          message: "Failed to delete user",
        });
      }
    });

    // =====================================
    //              ITEMS CRUD
    // =====================================

    //! Create Lost / Found Post
    app.post("/items", async (req, res) => {
      try {
        const {
          userId,
          type,
          itemName,
          category,
          description,
          images,
          location,
          date,
          approximateTime,
          identifyingFeatures,
          contactPreference,
        } = req.body;

        // Required field validation
        if (
          !userId ||
          !type ||
          !itemName ||
          !category ||
          !description ||
          !location?.area ||
          !date
        ) {
          return res.status(400).send({
            success: false,
            message: "Required information is missing",
          });
        }

        // Type validation
        if (!ITEM_TYPES.includes(type)) {
          return res.status(400).send({
            success: false,
            message: "Invalid item type",
          });
        }

        // Category validation
        if (!CATEGORIES.includes(category)) {
          return res.status(400).send({
            success: false,
            message: "Invalid category",
          });
        }

        // Image validation
        if (images !== undefined && !Array.isArray(images)) {
          return res.status(400).send({
            success: false,
            message: "Images must be an array",
          });
        }

        // Date validation
        const itemDate = new Date(date);

        if (isNaN(itemDate.getTime())) {
          return res.status(400).send({
            success: false,
            message: "Invalid date",
          });
        }

        // Find user
        const user = await usersCollection.findOne({ userId });

        if (!user) {
          return res.status(404).send({
            success: false,
            message: "User not found",
          });
        }

        // University validation
        if (!user.collegeId) {
          return res.status(400).send({
            success: false,
            message: "Please select your university first",
          });
        }

        // Create item document
        const newItem = {
          type,
          itemName: itemName.trim(),
          category,
          description: description.trim(),

          images: images || [],

          location: {
            area: location.area,
            specificLocation: location.specificLocation || "",
          },

          date: itemDate,
          approximateTime: approximateTime || "",

          identifyingFeatures: identifyingFeatures || "",

          userId: user.userId,

          // From database, not request body
          universityCode: user.collegeId,

          postStatus: "active",

          moderationStatus: "approved",

          contactPreference: contactPreference || "",

          isDeleted: false,

          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await itemsCollection.insertOne(newItem);

        res.status(201).send({
          success: true,
          message: "Item posted successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Create item error:", error);

        res.status(500).send({
          success: false,
          message: "Failed to create item",
        });
      }
    });

    //! Get All Items (University Wise)
    app.get("/items", async (req, res) => {
      try {
        const {
          userId,
          type,
          category,
          search,
          page = 1,
          limit = 12,
        } = req.query;

        if (!userId) {
          return res.status(400).send({
            success: false,
            message: "User ID is required",
          });
        }

        // Find logged in user
        const user = await usersCollection.findOne({ userId });

        if (!user || !user.collegeId) {
          return res.status(404).send({
            success: false,
            message: "User or university not found",
          });
        }

        // Base query
        const query = {
          universityCode: user.collegeId,
          postStatus: "active",
          moderationStatus: "approved",
          isDeleted: false,
        };

        // Filter by type
        if (type) {
          if (!ITEM_TYPES.includes(type)) {
            return res.status(400).send({
              success: false,
              message: "Invalid item type",
            });
          }

          query.type = type;
        }

        // Filter by category
        if (category) {
          if (!CATEGORIES.includes(category)) {
            return res.status(400).send({
              success: false,
              message: "Invalid category",
            });
          }

          query.category = category;
        }

        // Search by item name
        if (search) {
          query.itemName = {
            $regex: search,
            $options: "i",
          };
        }

        const currentPage = Math.max(1, Number(page) || 1);
        const perPage = Math.min(50, Math.max(1, Number(limit) || 12));

        const totalItems = await itemsCollection.countDocuments(query);

        const items = await itemsCollection
          .find(query)
          .sort({ createdAt: -1 })
          .skip((currentPage - 1) * perPage)
          .limit(perPage)
          .toArray();

        res.send({
          success: true,
          totalItems,
          currentPage,
          totalPages: Math.ceil(totalItems / perPage),
          items,
        });
      } catch (error) {
        console.error("Get items error:", error);

        res.status(500).send({
          success: false,
          message: "Failed to get items",
        });
      }
    });

    //! Get My Posts (Logged-in User)
    app.get("/items/my-posts", async (req, res) => {
      try {
        const {
          userId,
          type,
          category,
          search,
          page = 1,
          limit = 12,
        } = req.query;

        if (!userId) {
          return res.status(400).send({
            success: false,
            message: "User ID is required",
          });
        }

        // Find logged-in user
        const user = await usersCollection.findOne({ userId });

        if (!user || !user.collegeId) {
          return res.status(404).send({
            success: false,
            message: "User or university not found",
          });
        }

        // Only this user's posts
        const query = {
          userId: user.userId,
          universityCode: user.collegeId,
          isDeleted: false,
        };

        // Filter by Lost / Found
        if (type && type !== "all") {
          if (!ITEM_TYPES.includes(type)) {
            return res.status(400).send({
              success: false,
              message: "Invalid item type",
            });
          }

          query.type = type;
        }

        // Filter by category
        if (category) {
          if (!CATEGORIES.includes(category)) {
            return res.status(400).send({
              success: false,
              message: "Invalid category",
            });
          }

          query.category = category;
        }

        // Search by item name
        if (search?.trim()) {
          const escapedSearch = search
            .trim()
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

          query.itemName = {
            $regex: escapedSearch,
            $options: "i",
          };
        }

        const currentPage = Math.max(1, Number(page) || 1);
        const perPage = Math.min(50, Math.max(1, Number(limit) || 12));

        const totalItems = await itemsCollection.countDocuments(query);

        const items = await itemsCollection
          .find(query)
          .sort({ createdAt: -1 })
          .skip((currentPage - 1) * perPage)
          .limit(perPage)
          .toArray();

        res.send({
          success: true,
          totalItems,
          currentPage,
          totalPages: Math.ceil(totalItems / perPage),
          items,
        });
      } catch (error) {
        console.error("Get my posts error:", error);

        res.status(500).send({
          success: false,
          message: "Failed to get your posts",
        });
      }
    });

    //! Get Single Item
    app.get("/items/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { userId } = req.query;

        if (!isValidId(id) || !userId) {
          return res.status(400).send({
            success: false,
            message: "Invalid item ID or missing user ID",
          });
        }

        const user = await usersCollection.findOne({ userId });

        if (!user || !user.collegeId) {
          return res.status(404).send({
            success: false,
            message: "User or university not found",
          });
        }

        const item = await itemsCollection.findOne({
          _id: new ObjectId(id),
          universityCode: user.collegeId,
          isDeleted: false,
          moderationStatus: "approved",
        });

        if (!item) {
          return res.status(404).send({
            success: false,
            message: "Item not found",
          });
        }

        res.send({
          success: true,
          item,
        });
      } catch (error) {
        console.error(error);

        res.status(500).send({
          success: false,
          message: "Failed to get item",
        });
      }
    });

    //! Update Item
    app.patch("/items/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!isValidId(id) || !userId) {
          return res.status(400).send({
            success: false,
            message: "Invalid item ID or missing user ID",
          });
        }

        const user = await usersCollection.findOne({ userId });

        if (!user) {
          return res.status(404).send({
            success: false,
            message: "User not found",
          });
        }

        const item = await itemsCollection.findOne({
          _id: new ObjectId(id),
          userId,
          universityCode: user.collegeId,
          isDeleted: false,
        });

        if (!item) {
          return res.status(404).send({
            success: false,
            message: "Item not found or you are not the owner",
          });
        }

        const {
          type,
          itemName,
          category,
          description,
          images,
          location,
          date,
          approximateTime,
          identifyingFeatures,
          contactPreference,
        } = req.body;

        const updateData = {};

        if (type !== undefined) {
          if (!ITEM_TYPES.includes(type)) {
            return res.status(400).send({
              message: "Invalid item type",
            });
          }

          updateData.type = type;
        }

        if (itemName !== undefined) {
          if (!itemName.trim()) {
            return res.status(400).send({
              message: "Item name cannot be empty",
            });
          }

          updateData.itemName = itemName.trim();
        }

        if (category !== undefined) {
          if (!CATEGORIES.includes(category)) {
            return res.status(400).send({
              message: "Invalid category",
            });
          }

          updateData.category = category;
        }

        if (description !== undefined) {
          updateData.description = description;
        }

        if (images !== undefined) {
          if (!Array.isArray(images)) {
            return res.status(400).send({
              message: "Images must be an array",
            });
          }

          updateData.images = images;
        }

        if (location !== undefined) {
          if (!location.area) {
            return res.status(400).send({
              message: "Location area is required",
            });
          }

          updateData.location = {
            area: location.area,
            specificLocation: location.specificLocation || "",
          };
        }

        if (date !== undefined) {
          const newDate = new Date(date);

          if (isNaN(newDate.getTime())) {
            return res.status(400).send({
              message: "Invalid date",
            });
          }

          updateData.date = newDate;
        }

        if (approximateTime !== undefined) {
          updateData.approximateTime = approximateTime;
        }

        if (identifyingFeatures !== undefined) {
          updateData.identifyingFeatures = identifyingFeatures;
        }

        if (contactPreference !== undefined) {
          updateData.contactPreference = contactPreference;
        }

        if (Object.keys(updateData).length === 0) {
          return res.status(400).send({
            message: "No data provided to update",
          });
        }

        updateData.updatedAt = new Date();

        const result = await itemsCollection.updateOne(
          {
            _id: new ObjectId(id),
            userId,
            universityCode: user.collegeId,
            isDeleted: false,
          },
          {
            $set: updateData,
          },
        );

        res.send({
          success: true,
          message: "Item updated successfully",
          modifiedCount: result.modifiedCount,
        });
      } catch (error) {
        console.error("Update item error:", error);

        res.status(500).send({
          success: false,
          message: "Failed to update item",
        });
      }
    });

    //! Update Post Status
    app.patch("/items/:id/status", async (req, res) => {
      try {
        const { id } = req.params;
        const { userId, postStatus } = req.body;

        if (!isValidId(id) || !userId) {
          return res.status(400).send({
            message: "Invalid item ID or missing user ID",
          });
        }

        if (!POST_STATUSES.includes(postStatus)) {
          return res.status(400).send({
            message: "Invalid post status",
          });
        }

        const user = await usersCollection.findOne({ userId });

        if (!user) {
          return res.status(404).send({
            message: "User not found",
          });
        }

        const result = await itemsCollection.updateOne(
          {
            _id: new ObjectId(id),
            userId,
            universityCode: user.collegeId,
            isDeleted: false,
          },
          {
            $set: {
              postStatus,
              updatedAt: new Date(),
            },
          },
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({
            message: "Item not found or you are not the owner",
          });
        }

        res.send({
          success: true,
          message: "Post status updated successfully",
        });
      } catch (error) {
        console.error(error);

        res.status(500).send({
          success: false,
          message: "Failed to update post status",
        });
      }
    });

    //! Delete Item (Soft Delete)
    app.delete("/items/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!isValidId(id) || !userId) {
          return res.status(400).send({
            message: "Invalid item ID or missing user ID",
          });
        }

        const user = await usersCollection.findOne({ userId });

        if (!user) {
          return res.status(404).send({
            message: "User not found",
          });
        }

        const result = await itemsCollection.updateOne(
          {
            _id: new ObjectId(id),
            userId,
            universityCode: user.collegeId,
            isDeleted: false,
          },
          {
            $set: {
              isDeleted: true,
              deletedAt: new Date(),
              updatedAt: new Date(),
            },
          },
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Item not found or you are not the owner",
          });
        }

        res.send({
          success: true,
          message: "Item deleted successfully",
        });
      } catch (error) {
        console.error("Delete item error:", error);

        res.status(500).send({
          success: false,
          message: "Failed to delete item",
        });
      }
    });

    // =====================================
    //              SERVER
    // =====================================

    app.listen(port, () => {
      console.log(`Server is running at port: ${port}`);
    });
  } catch (error) {
    console.error("Server error:", error);
  }
}

run();
