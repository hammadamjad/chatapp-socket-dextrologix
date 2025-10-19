import mongoose, { Document, Schema } from 'mongoose';

export interface UserModel extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  provider: 'credentials' | 'google';
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function (this: UserModel) {
        return this.provider === 'credentials';
      },
    },
    image: {
      type: String,
    },
    provider: {
      type: String,
      enum: ['credentials', 'google'],
      default: 'credentials',
    },
    emailVerified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
UserSchema.index({ email: 1 });
UserSchema.index({ provider: 1 });

export default mongoose.models.User ||
  mongoose.model<UserModel>('User', UserSchema);
