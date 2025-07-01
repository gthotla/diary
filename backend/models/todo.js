import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  task: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true,
    minlength: [5, 'Task name must be at least 5 characters long'],
  },
  description: {
    type: String,
    required: false,
  },
  dueDate: {
    type: Date,
    required: false,
  },
 status: {
    type: String,
    enum: ["todo", "in-progress", "done"],
    default: 'To Do'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  userId:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  },
},{
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});


todoSchema.pre('save', function (next) {
  if (this.dueDate) {
    const now = new Date();
    const hoursUntilDue = (this.dueDate - now) / 36e5;
    if (hoursUntilDue < 48) {
      this.priority = 'high';
    }
  }
  next();
});

// Create a model based on the schema
const Todo =  mongoose.models.Todo || mongoose.model('Todo', todoSchema);

export default Todo;
