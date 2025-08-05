import RegisteredCourse from "../models/registeredCourses.js";
import SkillListing from "../models/skillListing.js";
import { User } from "../models/user.model.js";

// Controller to register a course
export const registerCourse = async (req, res) => {
    try{
        const { studentId, courseId, contactNo, paymentMethod, transactionID } = req.body;

        // Validate required fields
        if (!studentId || !courseId || !contactNo || !paymentMethod || !transactionID) {
            return res.status(400).json({ message: "Missing required fields", success: false });
        }

        // Check if the course exists
        const course = await SkillListing.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found", success: false });
        }
        // Check if the student exists
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found", success: false });
        }

        // Check if student is already registered for this course
        const existingRegistration = await RegisteredCourse.findOne({ studentId, courseId });
        if (existingRegistration) {
            return res.status(409).json({ message: "Student is already registered for this course", success: false });
        }

        // Create the registered course entry with status "pending"
        const registeredCourse = new RegisteredCourse({
            studentId,
            courseId,
            contactNo,
            paymentMethod,
            transactionID,
            status: "pending"
        });
        await registeredCourse.save();

        // Populate the registered course with full details before returning
        const populatedRegistration = await RegisteredCourse.findById(registeredCourse._id)
            .populate('courseId', 'title description fee duration paymentMethods proficiency listingImgURL teacherID')
            .populate('studentId', 'fullname email')
            .populate({
                path: 'courseId',
                populate: {
                    path: 'teacherID',
                    select: 'fullname email'
                }
            });

        return res.status(201).json({ 
            message: "Course registered successfully", 
            success: true, 
            data: populatedRegistration 
        });
    } catch (error) {
        console.error("Error registering course:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Controller to get registered courses by student ID
export const getRegisteredCoursesByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        if (!studentId) {
            return res.status(400).json({ message: "Student ID is required", success: false });
        }
        // Find registered courses for the student
        const registeredCourses = await RegisteredCourse.find({ studentId })
            .populate('courseId', 'title description fee duration paymentMethods') // Populate course details
            .populate('studentId', 'fullname email'); // Populate student details
        if (registeredCourses.length === 0) {
            return res.status(404).json({ message: "No registered courses found for this student", success: false });
        }
        return res.status(200).json({ message: "Registered courses retrieved successfully", success: true, data: registeredCourses });
    } catch (error) {
        console.error("Error fetching registered courses:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Check if a student is registered for a specific course
export const isStudentRegisteredForCourse = async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        if (!studentId || !courseId) {
            return res.status(400).json({ message: "Student ID and Course ID are required", success: false });
        }
        // Check if the student is registered for the course
        const registration = await RegisteredCourse.findOne({ studentId, courseId });
        if (!registration) {
            return res.status(200).json({ message: "Student is not registered for this course", success: false, registered: false });
        }
        return res.status(200).json({ message: "Student is registered for this course", success: true, data: registration });
    }
    catch (error) {
        console.error("Error checking course registration:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};