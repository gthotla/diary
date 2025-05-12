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
  completed: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
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
const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
