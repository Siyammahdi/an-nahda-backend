import mongoose, { Document, Schema } from "mongoose";

// ✅ Interface exported properly
export interface ICourse extends Document {
  courseName: string;
  imagePath: string;
  title: string;
  description: string;
  introduction: string[];
  courseHighlights: {
    title: string;
    description: string;
    features: { [key: string]: string }[];
  };
  courseDetails: {
    title: string;
    schedule: { [key: string]: string }[];
    platform: string;
    fees: {
      courseFee: string;
      scholarships: string;
    };
  };
  callToAction: {
    title: string;
    description: string;
    encouragement: string;
  };
}

const CourseSchema: Schema = new Schema(
  {
    courseName: { type: String, required: true },
    imagePath: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    introduction: [{ type: String }],
    courseHighlights: {
      title: String,
      description: String,
      features: [{ type: Map, of: String }],
    },
    courseDetails: {
      title: String,
      schedule: [{ type: Map, of: String }],
      platform: String,
      fees: {
        courseFee: String,
        scholarships: String,
      },
    },
    callToAction: {
      title: String,
      description: String,
      encouragement: String,
    },
  },
  { timestamps: true }
);

// ✅ Default export model and named export interface
export default mongoose.model<ICourse>("Course", CourseSchema);
