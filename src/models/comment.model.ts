import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  post: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  parentComment?: mongoose.Types.ObjectId | null;
  depth: number;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null
    },
    depth: {
      type: Number,
      default: 0,
      min: 0,
      max: 4
    }
  },
  {
    timestamps: true
  }
);

commentSchema.index({ post: 1, parentComment: 1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
