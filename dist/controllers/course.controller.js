"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourseById = exports.getCourses = void 0;
const course_model_1 = __importDefault(require("../models/course.model"));
// ✅ Get all courses
const getCourses = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield course_model_1.default.find();
        res.status(200).json(courses);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to retrieve courses" });
    }
});
exports.getCourses = getCourses;
// ✅ Get a course by ID
const getCourseById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const course = yield course_model_1.default.findById(req.params.id);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        res.status(200).json(course);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to retrieve course" });
    }
});
exports.getCourseById = getCourseById;
// ✅ Create a new course
const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newCourse = new course_model_1.default(req.body);
        const savedCourse = yield newCourse.save();
        res.status(201).json(savedCourse);
    }
    catch (error) {
        res.status(400).json({ message: "Failed to create course" });
    }
});
exports.createCourse = createCourse;
// ✅ Update a course by ID
const updateCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedCourse = yield course_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCourse) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        res.status(200).json(updatedCourse);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update course" });
    }
});
exports.updateCourse = updateCourse;
// ✅ Delete a course by ID
const deleteCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedCourse = yield course_model_1.default.findByIdAndDelete(req.params.id);
        if (!deletedCourse) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        res.status(200).json({ message: "Course deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete course" });
    }
});
exports.deleteCourse = deleteCourse;
