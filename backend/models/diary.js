import mongoose from "mongoose";
const diarySchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,'Title is required.'],
        trim:true,
        minlength:[5,'Title should be at least 5 characters long']
    },
    entry:{
        type:String,
        required:[true,'Entry is required.'],
        minlength:[10,'Entry must be at least 10 characters long']
    },
    mood: {
        type: String,
        enum: ['happy', 'sad', 'neutral', 'excited', 'angry'],
        default: 'neutral',
      },
      images: [{
        type: String,
        required: false, // Path like: "/uploads/images/abc.jpg"
      }],
      videos: [{
        type: String,
        required: false, // Path like: "/uploads/videos/xyz.mp4"
      }],
      links: [{
        type: String,
        required: false, // External links like "https://example.com"
      }],
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, 
      },
      date: {
        type: Date,
        default: Date.now,
      },
},{
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

const Diary = mongoose.model('Diary', diarySchema);

export default Diary;