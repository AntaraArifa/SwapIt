import Skill from "../models/skills.js";
import { User } from "../models/user.model.js";


// Create a new skill
export const createSkill = async (req, res) => {
    try {
        const { userId } = req.user; // from auth middleware
        const { name, description, category, tags } = req.body;

        // 1️⃣ Validate input
        if (!name) {
        return res.status(400).json({ message: "Skill name is required", success: false });
        }

        // 2️⃣ Validate user
        const user = await User.findById(userId);
        if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
        }

        // 3️⃣ Only allow teacher or admin to create skill
        if (user.role !== "teacher") {
        return res.status(403).json({ message: "Only teachers can create new skills", success: false });
        }

        // 4️⃣ Check if skill with same name exists
        const existingSkill = await Skill.findOne({ name: name.trim() });
        if (existingSkill) {
        return res.status(400).json({ message: "Skill already exists", success: false });
        }

        // 5️⃣ Create new skill with userId
        const skill = new Skill({
            name: name.trim(),
            description,
            category,
            tags,
            createdBy: user._id, // updated field name
        });

        await skill.save();

        return res.status(201).json({
        message: "Skill created successfully",
        success: true,
        skill,
        });

    } catch (error) {
        console.error("Create Skill Error:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

