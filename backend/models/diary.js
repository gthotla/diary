import mongoose from "mongoose";
const diarySchema = new mongoose.Schema({
  todoIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Todo'
  }],
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

const Diary = mongoose.model('Diary', diarySchema);

export default Diary;