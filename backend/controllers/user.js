import User from "../models/user.js";
import Todo from "../models/todo.js";
import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken';

const generateAccessToken = ({ userId, username, email }) => {
  return jwt.sign(
    { userId, username, email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = ({ userId, username, email }) => {
  return jwt.sign(
    { userId, username, email },
    process.env.JWT_SECRET, { expiresIn: '7d' }
  );
};

const getUserStats = async (userId) => {
  const totalTodos = await Todo.countDocuments({ userId });
  const completedTodos = await Todo.countDocuments({ userId, status: 'done' });
  return { totalTodos, completedTodos };
};


export const register = asyncHandler(async (req, res) => {
  try {
    const { username, email, password, profile } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });
    const user = await User.create({
      username,
      email,
      password,
      profile: {}
    })
    const accessToken = generateAccessToken({ userId: user._id, username: user.username, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id, username: user.username, email: user.email });

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true, // can't be accessed by JavaScript
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',  // ensure cookies are sent over HTTPS (set to true in production)
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const { totalTodos, completedTodos } = await getUserStats(user._id);

    res.status(201).json({
      success: true,
      message: 'User created succesfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        todosCount: totalTodos,
        completedTodosCount: completedTodos,
      },
      access_token: accessToken,
      refresh_token: refreshToken
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})
export const UpdateProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.userId // From auth middleware
    const profileData = req.body

    console.log('Backend - Received profile data:', profileData)
    console.log('Backend - User ID:', userId)

    // Validate that we have a user ID
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    // Even if profile data is empty, allow the update (for skip functionality)
    const updateData = {}

    // Only include fields that are provided and not empty
    if (profileData.name && profileData.name.trim()) {
      updateData['profile.name'] = profileData.name.trim()
    }
    if (profileData.bio && profileData.bio.trim()) {
      updateData['profile.bio'] = profileData.bio.trim()
    }
    if (profileData.dob) {
      updateData.dob = profileData.dob
    }
    if (profileData.theme) {
      updateData['profile.settings.theme'] = profileData.theme
    }
    if (typeof profileData.notifications === 'boolean') {
      updateData['profile.settings.notifications'] = profileData.notifications
    }
    if (profileData.timezone) {
      updateData['profile.settings.timezone'] = profileData.timezone
    }

    // Add profile completion flag
    updateData.profileCompleted = true
    updateData.updatedAt = new Date()

    console.log('Backend - Update data:', updateData)

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password') // Exclude password from response

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Get updated stats
    const { totalTodos, completedTodos } = await getUserStats(userId);

    // Return success response
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        dob: updatedUser.dob,
        profileCompleted: updatedUser.profileCompleted,
        todosCount: totalTodos,
        completedTodosCount: completedTodos,
        profile: {
          name: updatedUser.profile?.name,
          bio: updatedUser.profile?.bio,
          theme: updatedUser.profile?.theme,
          settings: {
            notifications: updatedUser.profile?.settings?.notifications,
            timezone: updatedUser.profile?.settings?.timezone
          }
        }
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error("Error updating profile:", error);
  }
});
export const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email" });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const accessToken = generateAccessToken({ userId: user._id, username: user.username, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id, username: user.username, email: user.email });

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true, // can't be accessed by JavaScript
      secure: isProduction,   // ensure cookies are sent over HTTPS (set to true in production)
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    // console.log('Set-Cookie:', res.getHeaders()['set-cookie']);
    // console.log('AccessToken Payload:', jwt.decode(accessToken));
    //console.log('RefreshToken Payload:', jwt.decode(refreshToken));

    const { totalTodos, completedTodos } = await getUserStats(user._id);

    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        dob: user.dob,
        profileCompleted: user.profileCompleted,
        createdAt: user.createdAt,
        todosCount: totalTodos,
        completedTodosCount: completedTodos,
        profile: {
          name: user.profile?.name,
          bio: user.profile?.bio,
          theme: user.profile?.theme,
          settings: {
            notifications: user.profile?.settings?.notifications,
            timezone: user.profile?.settings?.timezone
          }
        }
      },
      access_token: accessToken,
      refresh_token: refreshToken
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

export const getUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.userId }).select('-password');
    const { totalTodos, completedTodos } = await getUserStats(user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        dob: user.dob,
        profileCompleted: user.profileCompleted,
        createdAt: user.createdAt,
        todosCount: totalTodos,
        completedTodosCount: completedTodos,
        profile: {
          name: user.profile?.name,
          bio: user.profile?.bio,
          theme: user.profile?.theme,
          settings: {
            notifications: user.profile?.settings?.notifications,
            timezone: user.profile?.settings?.timezone
          }
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

export const updateUser = asyncHandler(async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password');
    if (!user) return res.status(404).json({ message: "Can`t update the user profile" });
    res.status(200).json({ message: "User updated succesfully", user });

  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
})

export const logout = asyncHandler(async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,  // Set this to true in production (i.e., only over HTTPS)
      sameSite: isProduction ? 'none' : 'lax',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProduction,  // Set this to true in production
      sameSite: isProduction ? 'none' : 'lax',
    });

    res.status(200).json({ message: "User logged out sucessfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})
export const getAccessToken = asyncHandler(async (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) return res.status(401).json({ message: "No token is provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid refresh token" });
      const { userId, username, email } = decoded;
      const newAccessToken = generateAccessToken({ userId, username, email });
      const isProduction = process.env.NODE_ENV === 'production';

      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });
      res.status(200).json({ access_token: newAccessToken });
    })
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});