import { RequestHandler } from "express";
import Course, { ICourse } from "../models/course.model";

// ✅ Get all courses
export const getCourses: RequestHandler<{}, ICourse[] | { message: string }> = async (_, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve courses" });
  }
};

// ✅ Get a course by ID
export const getCourseById: RequestHandler<{ id: string }, ICourse | { message: string }> = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve course" });
  }
};

// ✅ Create a new course
export const createCourse: RequestHandler<{}, ICourse | { message: string }, Partial<ICourse>> = async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(400).json({ message: "Failed to create course" });
  }
};

// ✅ Update a course by ID
export const updateCourse: RequestHandler<{ id: string }, ICourse | { message: string }, Partial<ICourse>> = async (
  req,
  res
) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCourse) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: "Failed to update course" });
  }
};

// ✅ Delete a course by ID
export const deleteCourse: RequestHandler<{ id: string }, { message: string }> = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course" });
  }
};
