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

// Check course registration status for a student
export const checkCourseStatus = async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        if (!studentId || !courseId) {
            return res.status(400).json({ message: "Student ID and Course ID are required", success: false });
        }
        // Check if the student is registered for the course
        const registration = await RegisteredCourse.findOne({ studentId, courseId });
        if (!registration) {
            return res.status(200).json({ 
                message: "Student is not registered for this course", 
                success: true, 
                status: "notRegistered" 
            });
        }
        return res.status(200).json({ 
            message: "Course registration status retrieved successfully", 
            success: true, 
            status: registration.status || registration.courseStatus,
            data: registration 
        });
    }
    catch (error) {
        console.error("Error checking course registration status:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Controller to update course registration status
export const updateCourseRegistrationStatus = async (req, res) => {
    try{
        const { registrationId, teacherId } = req.body;
        
        // Validate required fields
        if (!registrationId || !teacherId) {
            return res.status(400).json({ 
                message: "Registration ID and teacher ID are required", 
                success: false 
            });
        }

        // Find the registration with populated course details
        const registration = await RegisteredCourse.findById(registrationId)
            .populate({
                path: 'courseId',
                select: 'teacherID title',
                populate: {
                    path: 'teacherID',
                    select: '_id fullname'
                }
            });

        if (!registration) {
            return res.status(404).json({ 
                message: "Registration not found", 
                success: false 
            });
        }

        // Check if the teacher is authorized (only the course instructor can update status)
        if (registration.courseId.teacherID._id.toString() !== teacherId.toString()) {
            return res.status(403).json({ 
                message: "Unauthorized. Only the course instructor can update registration status", 
                success: false 
            });
        }

        // Check if the current status is "pending"
        if (registration.status !== "pending") {
            return res.status(400).json({ 
                message: `Cannot update status. Current status is "${registration.status}". Only pending registrations can be approved.`, 
                success: false 
            });
        }

        // Update the registration status from "pending" to "registered"
        registration.status = "registered";
        registration.statusUpdatedAt = new Date();
        await registration.save();

        // Populate the updated registration with full details
        const updatedRegistration = await RegisteredCourse.findById(registrationId)
            .populate('courseId', 'title description fee duration proficiency')
            .populate('studentId', 'fullname email')
            .populate({
                path: 'courseId',
                populate: {
                    path: 'teacherID',
                    select: 'fullname email'
                }
            });

        return res.status(200).json({ 
            message: "Registration approved successfully. Status updated to registered.", 
            success: true, 
            data: updatedRegistration 
        });

    } catch (error) {
        console.error("Error updating registration status:", error);
        return res.status(500).json({ 
            message: "Internal server error", 
            success: false 
        });
    }
};


// Controller to get all students registered for a course
export const getStudentsRegisteredForCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { teacherId } = req.body;
        
        if (!courseId) {
            return res.status(400).json({ message: "Course ID is required", success: false });
        }
        
        if (!teacherId) {
            return res.status(400).json({ message: "Teacher ID is required", success: false });
        }

        // Check if the course exists and verify teacher authorization
        const course = await SkillListing.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found", success: false });
        }

        // Check if the teacher is authorized (only the course instructor can view students)
        if (course.teacherID.toString() !== teacherId.toString()) {
            return res.status(403).json({ 
                message: "Unauthorized. Only the course instructor can view registered students", 
                success: false 
            });
        }

        // Find all registrations for the course
        const registrations = await RegisteredCourse.find({ courseId })
            .populate('studentId', 'fullname email contactNo'); // Populate student details

        if (registrations.length === 0) {
            return res.status(404).json({ message: "No students registered for this course", success: false });
        }

        return res.status(200).json({ 
            message: "Students registered for the course retrieved successfully", 
            success: true, 
            data: registrations,
            count: registrations.length
        });
    } catch (error) {
        console.error("Error fetching students registered for course:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};