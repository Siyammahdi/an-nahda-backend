import { Request, Response } from 'express';
import User from '../models/user.model';
import Course from '../models/course.model';
import { AdminActivity, AdminSettings } from '../models/admin.model';
import mongoose, { Document } from 'mongoose';

// ================ USER MANAGEMENT ================

// Get all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    
    // Log admin activity
    await logAdminActivity(req, 'view', 'Retrieved all users', 'user');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error: any) {
    console.error('Get all users error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get single user
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Log admin activity
    await logAdminActivity(
      req, 
      'view', 
      `Retrieved user ${String(user.name)}`, 
      'user', 
      user._id as any
    );
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    console.error('Get user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });
    
    // Log admin activity
    await logAdminActivity(req, 'create', `Created new user ${String(user.name)}`, 'user', user._id);
    
    // Create a response object without the password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error: any) {
    console.error('Create user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fields that can be updated
    const { name, email, role } = req.body;
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    
    // Find and update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Log admin activity
    await logAdminActivity(req, 'update', `Updated user ${user.name}`, 'user', user._id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    console.error('Update user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // First get the user to log the details
    const user = await User.findById(req.params.id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Prevent deleting the current user
    if (user._id && user._id.toString() === req.user.id) {
      res.status(400).json({
        success: false,
        message: 'You cannot delete yourself'
      });
      return;
    }
    
    // Log admin activity before deletion
    await logAdminActivity(req, 'delete', `Deleted user ${user.name || ''}`, 'user', user._id);
    
    // Delete user
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ================ ADMIN DASHBOARD DATA ================

// Get admin dashboard statistics
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get counts of users and courses
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const courseCount = await Course.countDocuments();
    
    // Get recent admin activities
    const recentActivities = await AdminActivity.find()
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(10);
    
    // Get newest users
    const newUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Log admin activity
    await logAdminActivity(req, 'view', 'Viewed dashboard statistics', 'other');
    
    res.status(200).json({
      success: true,
      data: {
        stats: {
          users: userCount,
          admins: adminCount,
          courses: courseCount
        },
        recentActivities,
        newUsers
      }
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ================ ADMIN ACTIVITY LOGS ================

// Get admin activity logs
export const getActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    
    // Get total count of activities
    const total = await AdminActivity.countDocuments();
    
    // Get paginated activities
    const activities = await AdminActivity.find()
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .skip(startIndex)
      .limit(limit);
    
    // Log admin activity
    await logAdminActivity(req, 'view', 'Viewed activity logs', 'other');
    
    res.status(200).json({
      success: true,
      count: total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: activities
    });
  } catch (error: any) {
    console.error('Get activity logs error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ================ ADMIN SETTINGS ================

// Get all admin settings
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await AdminSettings.find();
    
    // Log admin activity
    await logAdminActivity(req, 'view', 'Retrieved admin settings', 'setting');
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    console.error('Get settings error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update admin setting
export const updateSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { setting, value, description } = req.body;
    
    // Find and update setting or create if it doesn't exist
    let adminSetting = await AdminSettings.findOne({ setting });
    
    if (adminSetting) {
      adminSetting.value = value;
      if (description) adminSetting.description = description;
      adminSetting.lastUpdated = new Date();
      adminSetting.updatedBy = new mongoose.Types.ObjectId(req.user.id);
      await adminSetting.save();
    } else {
      adminSetting = await AdminSettings.create({
        setting,
        value,
        description: description || `Setting for ${setting}`,
        updatedBy: req.user.id
      });
    }
    
    // Log admin activity
    await logAdminActivity(req, 'update', `Updated setting: ${setting}`, 'setting', adminSetting._id);
    
    res.status(200).json({
      success: true,
      data: adminSetting
    });
  } catch (error: any) {
    console.error('Update setting error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ================ HELPER FUNCTIONS ================

// Log admin activity helper function
const logAdminActivity = async (
  req: Request,
  action: string,
  details: string,
  resourceType: string,
  resourceId?: any // Using any type to accommodate various MongoDB ID representations
): Promise<void> => {
  try {
    // Get IP address
    const ip = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
    
    // Create activity log
    await AdminActivity.create({
      userId: req.user.id,
      action,
      details,
      resourceType,
      resourceId,
      ip,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
    // Don't throw the error, just log it
  }
}; 