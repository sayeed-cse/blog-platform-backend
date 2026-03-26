import mongoose, { Document, Schema } from 'mongoose';

export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    }
  },
  {
    timestamps: true
  }
);

bookmarkSchema.index({ user: 1, post: 1 }, { unique: true });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
