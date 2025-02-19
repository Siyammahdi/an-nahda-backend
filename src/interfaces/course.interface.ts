import { Document } from 'mongoose';

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

export interface CourseParams {
    id: string;
  }