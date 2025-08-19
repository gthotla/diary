import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import TimeZones from '../utils/Timezone.js';

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    minlength: [2, 'Username should be at least 2 characters long'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  },
  profile: {
    name: {
      type: String,
      default: null // not required during initial registration
    },
    bio: {
      type: String,
      minlength: [5, 'Bio should be at least 5 characters long'],
      default: null
    },
    dob: {
      type: Date,
      default: null // not required during initial registration
    },
    settings: {
      theme: {
        type: String,
        enum: ['dark', 'light', 'system'],
        default: 'system'
      },
      notifications: {
        type: Boolean,
        default: true
      },
      timezone: {
        type: String,
        enum: TimeZones,
        default: "UTC"
      }
    },
    diaryStats: {
      totalEntries: {
        type: Number,
        default: 0
      },
      lastEntryDate: {
        type: Date,
        default: null
      }
    }
  }
}, {
  timestamps: true
});


//  Pre-save: Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🛠️ Pre-findOneAndUpdate: Hash password if updated via findOneAndUpdate
userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (update?.password) {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    update.password = await bcrypt.hash(update.password, salt);
  }
  next();
});

// 📦 Pre-updateOne: Same logic
userSchema.pre('updateOne', async function (next) {
  const update = this.getUpdate();
  if (update?.password) {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    update.password = await bcrypt.hash(update.password, salt);
  }
  next();
});

// 🔎 Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ Method to check if profile is complete
userSchema.methods.isProfileComplete = function () {
  return !!(this.profile?.name && this.profile?.bio);
};

const User = mongoose.model('User', userSchema);
export default User;
