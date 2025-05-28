import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import TimeZones from '../utils/Timezone.js' 
const SALT_ROUNDS = 10;
 
const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:[true,'username is required'],
        minlength:[2,"Name should be at least 2 characters long"]
    },
    password:{
        type:String,
        required:[true,"password is required"]
    },
    email:{
        type:String,
        required:[true,"email is required"],
        match: [/.+\@.+\..+/, 'Please enter a valid email address'],
        unique: true,
    },
    dob:{
        type:Date,
        required:[true,"Date of birth is required "]
    },
    profile:{
        name:{
            type:String,
            required:[true,'Name is required']
        },
        bio:{
            type:String,
            required:[true ,'Bio is required'],
            minlength:[5,'Bio should be 5 characters long']
        },
        settings: {
            theme: {
                type:String,
                enum: ['dark','light','system'],
                default: 'system',
            }, // or "light"
            notifications: {
                type:Boolean,
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
              default: 0,
            },
            lastEntryDate: {
              type: Date,
              default: null,
            },
          }
          
    },

})

// 🔐 Pre-save: Hash password before saving
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
  
  // 🛠️ Pre-findOneAndUpdate: Hash if password is updated via findOneAndUpdate
  userSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    if (update?.password) {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      update.password = await bcrypt.hash(update.password, salt);
    }
    next();
  });
  
  // 📦 Pre-updateOne: Same logic for updateOne
  userSchema.pre('updateOne', async function (next) {
    const update = this.getUpdate();
    if (update?.password) {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      update.password = await bcrypt.hash(update.password, salt);
    }
    next();
  });
  
  
  // 🔎 Method for comparing password
  userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };
  
  const User = mongoose.model('User', userSchema);
  export default User;
  