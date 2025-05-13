const User = require("../models/User");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Make sure the request is from an admin or superadmin
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Only admins and superadmins can access this resource."
      });
    }

    // Get all users
    const users = await User.find(
      {},
      { password: 0, refreshToken: 0, token: 0 }
    ).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching users"
    });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    // Make sure the request is from an admin or superadmin
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Only admins and superadmins can access this resource."
      });
    }

    const userId = req.params.userId;
    const updates = req.body;

    // Remove sensitive fields from updates
    delete updates.password;
    delete updates.refreshToken;
    delete updates.token;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Prevent updating superadmin users unless you're a superadmin
    if (user.role === "superadmin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Cannot update superadmin users"
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -token');

    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the user"
    });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    // Make sure the request is from an admin or superadmin
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Only admins and superadmins can access this resource."
      });
    }

    const userId = req.params.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Prevent deleting superadmin users
    if (user.role === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete superadmin users"
      });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the user"
    });
  }
}; 