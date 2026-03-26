import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  title: string;
  content: string;
  image?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

postSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const Post = mongoose.model<IPost>('Post', postSchema);
