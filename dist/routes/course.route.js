"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_controller_1 = require("../controllers/course.controller");
const router = (0, express_1.Router)();
router.get("/courses", course_controller_1.getCourses);
router.post("/courses", course_controller_1.createCourse);
router.get("/courses/:id", course_controller_1.getCourseById);
router.put("/courses/:id", course_controller_1.updateCourse);
router.delete("/courses/:id", course_controller_1.deleteCourse);
exports.default = router;
