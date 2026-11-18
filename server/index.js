// ! Database = campus_find
// ! Collections = users, items, campuses

// npx nodemon index.js
// node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// =====================================
//              MIDDLEWARE
// =====================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://my-campus-find.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

// =====================================
//              MONGODB
// =====================================

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

// =====================================
//              CONSTANTS
// =====================================

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

const POST_STATUSES = ["active", "inactive", "resolved"];

const MODERATION_STATUSES = ["pending", "approved", "rejected"];

// =====================================
//              HELPERS
// =====================================

const isValidId = (id) => ObjectId.isValid(id);

const normalizeCampusCode = (code) => {
  if (typeof code !== "string") return "";
  return code.trim().toLowerCase();
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getPagination = (page, limit) => {
  const currentPage = Math.max(1, Number(page) || 1);
  const perPage = Math.min(50, Math.max(1, Number(limit) || 12));

  return { currentPage, perPage };
};

// =====================================
//              MAIN FUNCTION
// =====================================

async function run() {
  try {
    await client.connect();

    console.log("MongoDB connected successfully!");

    const database = client.db("campus_find");

    const usersCollection = database.collection("users");
    const itemsCollection = database.collection("items");
    const campusesCollection = database.collection("campuses");

    // =====================================
    //              INDEXES
    // =====================================

    await itemsCollection.createIndex({
      campusCode: 1,
      type: 1,
      postStatus: 1,
      createdAt: -1,
    });

    await itemsCollection.createIndex({
      userId: 1,
      createdAt: -1,
    });

    await campusesCollection.createIndex({ campusCode: 1 }, { unique: true });

    // =====================================
    //              HOME
    // =====================================

    app.get("/", (req, res) => {
      res.send("Campus Find Server is Running");
    });

    // =====================================
    //              USER CRUD
    // =====================================

    // ! Save User
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
          email: email.trim().toLowerCase(),
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
        console.error("Save user error:", error);

        res.status(500).send({
          success: false,
          message: "Failed to save user",
        });
      }
    });

    // ! Get All Users
    app.get("/users", async (req, res) => {
      try {
        const users = await usersCollection.find().toArray();

        res.send(users);
      } catch (error) {
        console.error("Get users error:", error);

        res.status(500).send({
          message: "Failed to get users",
        });
      }
    });

    // ! Get Single User
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
        console.error("Get user error:", error);

        res.status(500).send({
          message: "Failed to get user",
        });
      }
    });

    // ! Update User
    app.patch("/users/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        if (!userId) {
          return res.status(400).send({
            success: false,
            message: "User ID is required",
          });
        }

        const updateData = { ...req.body };

        const protectedFields = ["_id", "userId", "createdAt", "updatedAt"];

        protectedFields.forEach((field) => {
          delete updateData[field];
        });

        Object.keys(updateData).forEach((key) => {
          if (key.startsWith("$") || key.includes(".")) {
            delete updateData[key];
          }
        });

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
          { $set: updateData },
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
        });
      }
    });

    // ! Delete User
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
        console.error("Delete user error:", error);

        res.status(500).send({
          success: false,
          message: "Failed to delete user",
        });
      }
    });

    // =====================================
    //          CAMPUS MANAGEMENT
    // =====================================

    // ! Get All Campuses
    app.get("/campuses", async (req, res) => {
      try {
        const campuses = await campusesCollection
          .find({})
          .sort({ createdAt: -1 })
          .toArray();

        res.send({
          success: true,
          campuses,
        });
      } catch (error) {
        console.error("Get campuses error:", error);

        res.status(500).send({
          success: false,
          message: "Failed to get campuses",
        });
      }
    });

    // ! Add New Campus
    app.post("/campuses", async (req, res) => {
      try {
        const { campusName, campusCode } = req.body;

        if (
          typeof campusName !== "string" ||
          typeof campusCode !== "string" ||
          !campusName.trim() ||
          !campusCode.trim()
        ) {
          return res.status(400).send({
            success: false,
            message: "Campus name and code are required",
          });
        }

        const normalizedCode = campusCode.trim().toUpperCase();

        const existingCampus = await campusesCollection.findOne({
          campusCode: normalizedCode,
        });

        if (existingCampus) {
          return res.status(409).send({
            success: false,
            message: "This campus code already exists",
          });
        }

        const newCampus = {
          campusName: campusName.trim(),
          campusCode: normalizedCode,
          createdAt: new Date(),
        };

        const result = await campusesCollection.insertOne(newCampus);

        res.status(201).send({
          success: true,
          message: "Campus added successfully",
          campus: {
            _id: result.insertedId,
            ...newCampus,
          },
        });
      } catch (error) {
        console.error("Add campus error:", error);

        if (error.code === 11000) {
          return res.status(409).send({
            success: false,
            message: "This campus code already exists",
          });
        }

        res.status(500).send({
          success: false,
          message: "Failed to add campus",
        });
      }
    });

    // ! Delete Campus
    app.delete("/campuses/:id", async (req, res) => {
      try {
        const { id } = req.params;

        if (!isValidId(id)) {
          return res.status(400).send({
            success: false,
            message: "Invalid campus ID",
          });
        }

        const campus = await campusesCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!campus) {
          return res.status(404).send({
            success: false,
            message: "Campus not found",
          });
        }

        const campusCode = normalizeCampusCode(campus.campusCode);

        // Check assigned users
        const assignedUsers = await usersCollection.countDocuments({
          collegeId: {
            $regex: `^${escapeRegex(campus.campusCode.trim())}$`,
            $options: "i",
          },
        });

        if (assignedUsers > 0) {
          return res.status(409).send({
            success: false,
            message: `Cannot delete this campus. ${assignedUsers} user(s) are assigned to it.`,
          });
        }

        // Check associated posts
        const relatedPosts = await itemsCollection.countDocuments({
          campusCode,
        });

        if (relatedPosts > 0) {
          return res.status(409).send({
            success: false,
            message: `Cannot delete this campus. ${relatedPosts} post(s) are associated with it.`,
          });
        }

        await campusesCollection.deleteOne({
          _id: new ObjectId(id),
        });

        res.send({
          success: true,
          message: "Campus deleted successfully",
        });
      } catch (error) {
        console.error("Delete campus error:", error);

        res.status(500).send({
          success: false,
          message: "Failed to delete campus",
        });
      }
    });

    // =====================================
    //              ITEMS CRUD
    // =====================================

    // ! Create Lost / Found Post
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

        if (!ITEM_TYPES.includes(type)) {
          return res.status(400).send({
            success: false,
            message: "Invalid item type",
          });
        }

        if (!CATEGORIES.includes(category)) {
          return res.status(400).send({
            success: false,
            message: "Invalid category",
          });
        }

        if (images !== undefined && !Array.isArray(images)) {
          return res.status(400).send({
            success: false,
            message: "Images must be an array",
          });
        }

        const itemDate = new Date(date);

        if (isNaN(itemDate.getTime())) {
          return res.status(400).send({
            success: false,
            message: "Invalid date",
          });
        }

        const user = await usersCollection.findOne({ userId });

        if (!user) {
          return res.status(404).send({
            success: false,
            message: "User not found",
          });
        }

        if (!user.collegeId) {
          return res.status(400).send({
            success: false,
            message: "Please select your campus first",
          });
        }

        // ! Campus code comes from database user data
        const campusCode = normalizeCampusCode(user.collegeId);

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

          // ! Use campusCode instead of universityCode
          campusCode,

          postStatus: "active",
          moderationStatus: "pending",
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

    // ! Get All Items (Campus Wise)
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

        const user = await usersCollection.findOne({ userId });

        if (!user || !user.collegeId) {
          return res.status(404).send({
            success: false,
            message: "User or campus not found",
          });
        }

        const campusCode = normalizeCampusCode(user.collegeId);

        const query = {
          campusCode,
          postStatus: "active",
          moderationStatus: "approved",
          isDeleted: false,
        };

        if (type) {
          if (!ITEM_TYPES.includes(type)) {
            return res.status(400).send({
              success: false,
              message: "Invalid item type",
            });
          }

          query.type = type;
        }

        if (category) {
          if (!CATEGORIES.includes(category)) {
            return res.status(400).send({
              success: false,
              message: "Invalid category",
            });
          }

          query.category = category;
        }

        if (search?.trim()) {
          query.itemName = {
            $regex: escapeRegex(search.trim()),
            $options: "i",
          };
        }

        const { currentPage, perPage } = getPagination(page, limit);

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

    // ! Get My Posts
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

        const user = await usersCollection.findOne({ userId });

        if (!user || !user.collegeId) {
          return res.status(404).send({
            success: false,
            message: "User or campus not found",
          });
        }

        const campusCode = normalizeCampusCode(user.collegeId);

        const query = {
          userId: user.userId,
          campusCode,
          isDeleted: false,
        };

        if (type && type !== "all") {
          if (!ITEM_TYPES.includes(type)) {
            return res.status(400).send({
              success: false,
              message: "Invalid item type",
            });
          }

          query.type = type;
        }

        if (category && category !== "all") {
          if (!CATEGORIES.includes(category)) {
            return res.status(400).send({
              success: false,
              message: "Invalid category",
            });
          }

          query.category = category;
        }

        if (search?.trim()) {
          query.itemName = {
            $regex: escapeRegex(search.trim()),
            $options: "i",
          };
        }

        const { currentPage, perPage } = getPagination(page, limit);

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

    // ! Get Single Item
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
            message: "User or campus not found",
          });
        }

        const campusCode = normalizeCampusCode(user.collegeId);

        const item = await itemsCollection.findOne({
          _id: new ObjectId(id),
          campusCode,
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
        console.error("Get single item error:", error);

        res.status(500).send({
          success: false,
          message: "Failed to get item",
        });
      }
    });

    // ! Update Item
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

        if (!user || !user.collegeId) {
          return res.status(404).send({
            success: false,
            message: "User or campus not found",
          });
        }

        const campusCode = normalizeCampusCode(user.collegeId);

        const item = await itemsCollection.findOne({
          _id: new ObjectId(id),
          userId,
          campusCode,
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
          if (typeof itemName !== "string" || !itemName.trim()) {
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
            campusCode,
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

    // ! Update Post Status
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

        if (!user || !user.collegeId) {
          return res.status(404).send({
            message: "User or campus not found",
          });
        }

        const campusCode = normalizeCampusCode(user.collegeId);

        const result = await itemsCollection.updateOne(
          {
            _id: new ObjectId(id),
            userId,
            campusCode,
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
        console.error("Update post status error:", error);

        res.status(500).send({
          success: false,
          message: "Failed to update post status",
        });
      }
    });

    // ! Delete Item (Soft Delete)
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

        if (!user || !user.collegeId) {
          return res.status(404).send({
            message: "User or campus not found",
          });
        }

        const campusCode = normalizeCampusCode(user.collegeId);

        const result = await itemsCollection.updateOne(
          {
            _id: new ObjectId(id),
            userId,
            campusCode,
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
    //          ADMIN ITEMS MANAGEMENT
    // =====================================

    // ! Get All Posts for Admin
    app.get("/admin/items", async (req, res) => {
      try {
        const {
          type,
          category,
          search,
          moderationStatus,
          postStatus,
          campusCode,
          email,
          page = 1,
          limit = 12,
        } = req.query;

        // Base query
        const query = {
          isDeleted: false,
        };

        // Filter by campus code
        if (campusCode?.trim()) {
          query.campusCode = normalizeCampusCode(campusCode);
        }

        // Filter by user email
        if (email?.trim()) {
          const normalizedEmail = email.trim().toLowerCase();

          const user = await usersCollection.findOne({
            email: normalizedEmail,
          });

          if (!user) {
            return res.send({
              success: true,
              totalItems: 0,
              currentPage: 1,
              totalPages: 0,
              stats: {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
              },
              items: [],
            });
          }

          query.userId = user.userId;
        }

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
        if (category && category !== "all") {
          if (!CATEGORIES.includes(category)) {
            return res.status(400).send({
              success: false,
              message: "Invalid category",
            });
          }

          query.category = category;
        }

        // Filter by moderation status
        if (moderationStatus && moderationStatus !== "all") {
          if (!MODERATION_STATUSES.includes(moderationStatus)) {
            return res.status(400).send({
              success: false,
              message: "Invalid moderation status",
            });
          }

          query.moderationStatus = moderationStatus;
        }

        // Filter by post status
        if (postStatus && postStatus !== "all") {
          if (!POST_STATUSES.includes(postStatus)) {
            return res.status(400).send({
              success: false,
              message: "Invalid post status",
            });
          }

          query.postStatus = postStatus;
        }

        // Search by item name
        if (search?.trim()) {
          query.itemName = {
            $regex: escapeRegex(search.trim()),
            $options: "i",
          };
        }

        // Pagination
        const { currentPage, perPage } = getPagination(page, limit);

        // Total filtered posts
        const totalItems = await itemsCollection.countDocuments(query);

        // Overall dashboard statistics
        const baseQuery = {
          isDeleted: false,
        };

        const [pendingCount, approvedCount, rejectedCount, totalCount, items] =
          await Promise.all([
            itemsCollection.countDocuments({
              ...baseQuery,
              moderationStatus: "pending",
            }),

            itemsCollection.countDocuments({
              ...baseQuery,
              moderationStatus: "approved",
            }),

            itemsCollection.countDocuments({
              ...baseQuery,
              moderationStatus: "rejected",
            }),

            itemsCollection.countDocuments(baseQuery),

            itemsCollection
              .find(query)
              .sort({ createdAt: -1 })
              .skip((currentPage - 1) * perPage)
              .limit(perPage)
              .toArray(),
          ]);

        res.send({
          success: true,
          totalItems,
          currentPage,
          totalPages: Math.ceil(totalItems / perPage),

          stats: {
            total: totalCount,
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
          },

          items,
        });
      } catch (error) {
        console.error("Admin get items error:", error);

        res.status(500).send({
          success: false,
          message: "Failed to get posts",
        });
      }
    });

    // ! Update Moderation Status
    app.patch("/admin/items/:id/moderation", async (req, res) => {
      try {
        const { id } = req.params;
        const { moderationStatus } = req.body;

        if (!isValidId(id)) {
          return res.status(400).send({
            success: false,
            message: "Invalid item ID",
          });
        }

        if (!MODERATION_STATUSES.includes(moderationStatus)) {
          return res.status(400).send({
            success: false,
            message: "Invalid moderation status",
          });
        }

        const result = await itemsCollection.updateOne(
          {
            _id: new ObjectId(id),
            isDeleted: false,
          },
          {
            $set: {
              moderationStatus,
              updatedAt: new Date(),
            },
          },
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Post not found",
          });
        }

        res.send({
          success: true,
          message: `Post ${moderationStatus} successfully`,
        });
      } catch (error) {
        console.error("Moderation update error:", error);

        res.status(500).send({
          success: false,
          message: "Failed to update moderation status",
        });
      }
    });

    // ! Admin Update Post Status
    app.patch("/admin/items/:id/status", async (req, res) => {
      try {
        const { id } = req.params;
        const { postStatus } = req.body;

        if (!isValidId(id)) {
          return res.status(400).send({
            success: false,
            message: "Invalid item ID",
          });
        }

        if (!POST_STATUSES.includes(postStatus)) {
          return res.status(400).send({
            success: false,
            message: "Invalid post status",
          });
        }

        const result = await itemsCollection.updateOne(
          {
            _id: new ObjectId(id),
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
            success: false,
            message: "Post not found",
          });
        }

        res.send({
          success: true,
          message: "Post status updated successfully",
        });
      } catch (error) {
        console.error("Admin status update error:", error);

        res.status(500).send({
          success: false,
          message: "Failed to update post status",
        });
      }
    });

    // ! Admin Delete Post (Soft Delete)
    app.delete("/admin/items/:id", async (req, res) => {
      try {
        const { id } = req.params;

        if (!isValidId(id)) {
          return res.status(400).send({
            success: false,
            message: "Invalid item ID",
          });
        }

        const result = await itemsCollection.updateOne(
          {
            _id: new ObjectId(id),
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
            message: "Post not found",
          });
        }

        res.send({
          success: true,
          message: "Post deleted successfully",
        });
      } catch (error) {
        console.error("Admin delete error:", error);

        res.status(500).send({
          success: false,
          message: "Failed to delete post",
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
