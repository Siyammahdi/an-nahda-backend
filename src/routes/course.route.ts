import { Router } from "express";
import { getCourses, createCourse, getCourseById, updateCourse, deleteCourse } from "../controllers/course.controller";

const router = Router();

router.get("/courses", getCourses);
router.post("/courses", createCourse);
router.get("/courses/:id", getCourseById);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

export default router;
