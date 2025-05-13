const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const Product = require("../../models/Product");
const Order = require("../../models/Order");

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Make sure the request is from a superadmin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Only superadmins can access this resource."
      });
    }

    // Get count of all users
    const totalUsers = await User.countDocuments();
    
    // Get count of admin users
    const totalAdmins = await User.countDocuments({ role: "admin" });
    
    // Get count of new users in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsers = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get total sales and revenue
    const orders = await Order.find();
    const totalSales = orders.length;
    const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get admin statistics with their clients and products
    const adminStats = await User.aggregate([
      {
        $match: { role: "admin" }
      },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "adminId",
          as: "orders"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "orders.userId",
          foreignField: "_id",
          as: "clients"
        }
      },
      {
        $project: {
          adminId: "$_id",
          adminName: "$username",
          totalClients: { $size: { $setUnion: ["$clients._id", []] } },
          totalOrders: { $size: "$orders" },
          totalRevenue: { 
            $reduce: {
              input: "$orders",
              initialValue: 0,
              in: { $add: ["$$value", "$$this.totalAmount"] }
            }
          }
        }
      }
    ]);

    // Get user growth data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          users: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          _id: 0,
          date: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" }
            ]
          },
          users: 1
        }
      }
    ]);

    // Get sales data for the last 6 months
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          sales: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" }
            ]
          },
          sales: 1
        }
      }
    ]);

    // Get product distribution data
    const productDistribution = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        newUsers,
        totalProducts,
        totalSales,
        revenue,
        userGrowth,
        salesData,
        adminStats,
        productDistribution
      }
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching dashboard statistics"
    });
  }
};

// Get all admin users
const getAdmins = async (req, res) => {
  try {
    // Make sure the request is from a superadmin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Only superadmins can access this resource."
      });
    }

    // Get all users with admin role
    const admins = await User.find(
      { role: "admin" },
      { password: 0, refreshToken: 0, token: 0 }
    ).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      admins
    });
  } catch (error) {
    console.error("Error getting admin users:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching admin users"
    });
  }
};

// Create a new admin
const createAdmin = async (req, res) => {
  try {
    // Make sure the request is from a superadmin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Only superadmins can create admin accounts."
      });
    }

    const { username, email, password, firstname, lastname, address, phone, brand } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required."
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with the same email or username."
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the admin user
    const newAdmin = new User({
      username,
      email,
      password: hashedPassword,
      firstname: firstname || "",
      lastname: lastname || "",
      address: address || "",
      phone: phone || "",
      brand: brand || "none",
      role: "admin"
    });

    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      admin: {
        _id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        firstname: newAdmin.firstname,
        lastname: newAdmin.lastname,
        brand: newAdmin.brand,
        role: newAdmin.role
      }
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating admin user"
    });
  }
};

// Update an admin
const updateAdmin = async (req, res) => {
  try {
    // Make sure the request is from a superadmin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Only superadmins can update admin accounts."
      });
    }

    const { adminId } = req.params;
    const { username, email, firstname, lastname, address, phone, password, brand } = req.body;

    // Find the admin user
    const admin = await User.findOne({ _id: adminId, role: "admin" });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found."
      });
    }

    // Check if username or email already exists (excluding the current admin)
    if (username && username !== admin.username) {
      const existingUsername = await User.findOne({ username, _id: { $ne: adminId } });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: "Username already exists."
        });
      }
      admin.username = username;
    }

    if (email && email !== admin.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: adminId } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists."
        });
      }
      admin.email = email;
    }

    // Update other fields
    if (firstname) admin.firstname = firstname;
    if (lastname) admin.lastname = lastname;
    if (address) admin.address = address;
    if (phone) admin.phone = phone;
    if (brand) admin.brand = brand;

    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      admin.password = hashedPassword;
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Admin user updated successfully",
      admin: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        firstname: admin.firstname,
        lastname: admin.lastname,
        address: admin.address,
        phone: admin.phone,
        brand: admin.brand,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Error updating admin user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating admin user"
    });
  }
};

// Delete an admin
const deleteAdmin = async (req, res) => {
  try {
    // Make sure the request is from a superadmin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Only superadmins can delete admin accounts."
      });
    }

    const { adminId } = req.params;

    // Find and delete the admin user
    const admin = await User.findOneAndDelete({ _id: adminId, role: "admin" });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin user deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting admin user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting admin user"
    });
  }
};

// Get a specific admin
const getAdmin = async (req, res) => {
  try {
    // Make sure the request is from a superadmin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Only superadmins can access admin details."
      });
    }

    const { adminId } = req.params;

    // Find the admin user
    const admin = await User.findOne(
      { _id: adminId, role: "admin" },
      { password: 0, refreshToken: 0, token: 0 }
    );
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found."
      });
    }

    res.status(200).json({
      success: true,
      admin
    });
  } catch (error) {
    console.error("Error getting admin user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching admin user"
    });
  }
};

// Get users with verification images
const getUsersWithVerificationImages = async (req, res) => {
  try {
    // Make sure the request is from a superadmin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Only superadmins can access this resource."
      });
    }

    // Get all users with imageVerif field (non-empty)
    const users = await User.find(
      { 
        imageVerif: { $exists: true, $ne: "" },
        role: "user" // Only look at regular users, not admins or superadmins
      },
      { password: 0, refreshToken: 0, token: 0 }
    ).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error("Error getting users with verification images:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching users with verification images"
    });
  }
};

// Update user to admin role
const approveUserAsAdmin = async (req, res) => {
  try {
    // Make sure the request is from a superadmin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Only superadmins can approve admin accounts."
      });
    }

    const { userId } = req.params;
    const { brand } = req.body; // Récupérer la marque depuis le corps de la requête

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // Update user role to admin and assign brand
    user.role = "admin";
    
    // Si une marque est spécifiée, l'utiliser, sinon mettre "none"
    user.brand = brand || user.brand || "none";
    
    await user.save();

    res.status(200).json({
      success: true,
      message: "User approved as admin successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        brand: user.brand
      }
    });
  } catch (error) {
    console.error("Error approving user as admin:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while approving user as admin"
    });
  }
};

// Reject user admin request
const rejectUserAdminRequest = async (req, res) => {
  try {
    // Make sure the request is from a superadmin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Only superadmins can reject admin requests."
      });
    }

    const { userId } = req.params;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // Clear the verification image (optional)
    user.imageVerif = "";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Admin request rejected successfully"
    });
  } catch (error) {
    console.error("Error rejecting admin request:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while rejecting admin request"
    });
  }
};

module.exports = {
  getDashboardStats,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdmin,
  getUsersWithVerificationImages,
  approveUserAsAdmin,
  rejectUserAdminRequest
}; 