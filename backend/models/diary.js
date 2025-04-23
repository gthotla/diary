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
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, 
      },
      date: {
        type: Date,
        default: Date.now,
      },
})

const Diary = mongoose.model('Diary', diarySchema);

export default Diary;