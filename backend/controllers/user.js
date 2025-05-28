import User from "../models/user.js";
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


export const register = asyncHandler(async (req, res) => {
    try {
        const { username, email, password, dob, profile } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });
        const user = await User.create({
            username, email, password, dob, profile
        })
        const accessToken = generateAccessToken({ userId: user._id, username: user.username, email: user.email });
        const refreshToken = generateRefreshToken({ userId: user._id, username: user.username, email: user.email });
        res.cookie('access_token', accessToken, {
            httpOnly: true, // can't be accessed by JavaScript
            secure: false,
            sameSite: 'Lax',  // ensure cookies are sent over HTTPS (set to true in production)
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.status(201).json({ message: 'User created succesfully', user, access_token: accessToken, refresh_token: refreshToken });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})
export const login = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email" });
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        const accessToken = generateAccessToken({ userId: user._id, username: user.username, email: user.email });
        const refreshToken = generateRefreshToken({ userId: user._id, username: user.username, email: user.email });
        res.cookie('access_token', accessToken, {
            httpOnly: true, // can't be accessed by JavaScript
            secure: false,   // ensure cookies are sent over HTTPS (set to true in production)
            sameSite: 'Lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
       // console.log('Set-Cookie:', res.getHeaders()['set-cookie']);
      // console.log('AccessToken Payload:', jwt.decode(accessToken));
      //console.log('RefreshToken Payload:', jwt.decode(refreshToken));


        res.status(200).json({ message: 'User logged in succesfully', user, access_token: accessToken, refresh_token: refreshToken });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

export const getUser = asyncHandler(async (req, res) => {
    try {
        const user = await User.findOne({ _id:req.user.userId }).select('-password');
        res.status(200).json(user);
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
        })
        if (!user) return res.status(404).json({ message: "Can`t update the user profile" });
        res.status(200).json({ message: "User updated succesfully", user });

    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
})

export const logout = asyncHandler(async (req, res) => {
    try {
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: true,  // Set this to true in production (i.e., only over HTTPS)
        });

        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: true,  // Set this to true in production
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
            const {userId, username, email } = decoded;
            const newAccessToken = generateAccessToken({ userId, username, email });
            res.cookie('access_token', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });
            res.status(200).json({ access_token: newAccessToken });
        })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});