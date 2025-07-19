import SkillListing from "../models/skillListing.js";
import Skill from "../models/skills.js";
import { User } from "../models/user.model.js";

// Create a new skill listing
export const createSkillListing = async (req, res) => {
    try {
        const { title, description, fee, proficiency, skillID, listingImgURL } = req.body;
        const teacherID = req.user.userId; // Get teacherID from authenticated user

        // Validate fee
        if (fee < 0) {
            return res.status(400).json({ message: "Fee cannot be negative", success: false });
        }

        // Check if skill exists
        const skill = await Skill.findById(skillID);
        if (!skill) {
            return res.status(404).json({ message: "Skill not found", success: false });
        }

        // Check if the skill belongs to the authenticated user
        if (skill.userID.toString() !== teacherID) {
            return res.status(403).json({ message: "You can only create listings for your own skills", success: false });
        }

        const newListing = new SkillListing({
            title,
            description,
            fee,
            proficiency,
            skillID,
            teacherID, 
            listingImgURL
        });

        await newListing.save();

        // Populate teacher details to get full name
        const populatedListing = await SkillListing.findById(newListing._id).populate('teacherID', 'fullname email profile.profilePhoto');

        return res.status(201).json({ message: "Skill listing created successfully", success: true, listing: populatedListing });
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};


// Update an existing skill listing
export const updateSkillListing = async (req, res) => {
    try {
        const { title, description, fee, proficiency, skillID, listingImgURL } = req.body;
        const listingID = req.params.id;
        const teacherID = req.user.userId;

        // Validate fee
        if (fee < 0) {
            return res.status(400).json({ message: "Fee cannot be negative", success: false });
        }


        const skill = await Skill.findById(skillID);
        if (!skill) {
            return res.status(404).json({ message: "Skill not found", success: false });
        }

        // Check if the skill belongs to the authenticated user
        if (skill.userID.toString() !== teacherID) {
            return res.status(403).json({ message: "You can only update listings for your own skills", success: false });
        }

        // Check if listing exists
        const listing = await SkillListing.findById(listingID);
        if (!listing) {
            return res.status(404).json({ message: "Listing not found", success: false });
        }

        // Update listing details
        listing.title = title;
        listing.description = description;
        listing.fee = fee;
        listing.proficiency = proficiency;
        listing.skillID = skillID;
        listing.listingImgURL = listingImgURL;

        await listing.save();

        return res.status(200).json({ message: "Skill listing updated successfully", success: true, listing });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};


// Delete a skill listing
export const deleteSkillListing = async (req, res) => {
    try {
        const listingID = req.params.id;
        const teacherID = req.user.userId;

        // Check if listing exists
        const listing = await SkillListing.findById(listingID);
        if (!listing) {
            return res.status(404).json({ message: "Listing not found", success: false });
        }

        // Check if the listing belongs to the authenticated user
        if (listing.teacherID.toString() !== teacherID) {
            return res.status(403).json({ message: "You can only delete your own listings", success: false });
        }
        await SkillListing.findByIdAndDelete(listingID);
        return res.status(200).json({ message: "Listing deleted successfully", success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};


// Get all skill listings
export const getAllSkillListings = async (req, res) => {
    try {
        const listings = await SkillListing.find().populate('teacherID', 'fullname email profile.profilePhoto').populate('skillID', 'tags');
        const count = listings.length; // Get the count of listings
        return res.status(200).json({ 
            message: "Skill listings retrieved successfully", 
            success: true, 
            listings,
            count 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Get skill listings by lsiting ID
export const getSkillListingById = async (req, res) => {
    try {
        const listingID = req.params.id;

        // Check if listing exists
        const listing = await SkillListing.findById(listingID)
            .populate('teacherID', 'fullname email profile.profilePhoto')
            .populate('skillID', 'name');
        if (!listing) {
            return res.status(404).json({ message: "Listing not found", success: false });
        }
        return res.status(200).json({ message: "Skill listing retrieved successfully", success: true, listing });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Get skill listings by teacher ID
export const getSkillListingsByTeacherId = async (req, res) => {
    try {
        const teacherID = req.params.teacherId;

        // Check if teacher exists
        const teacher = await User.findById(teacherID);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found", success: false });
        }

        // Get listings by teacher ID
        const listings = await SkillListing.find({ teacherID }).populate('skillID', 'name');
        const count = listings.length; // Get the count of listings
        return res.status(200).json({ 
            message: "Skill listings retrieved successfully", 
            success: true, 
            listings,
            count 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Get skill listings by tag
export const getSkillListingsByTag = async (req, res) => {
    try {
        const tag = req.params.tag;

        // First, find skills that have the specified tag
        const skillsWithTag = await Skill.find({ tags: tag });
        
        if (skillsWithTag.length === 0) {
            return res.status(200).json({
                message: "No skills found with this tag",
                success: true,
                listings: [],
                count: 0
            });
        }

        // Get the skill IDs
        const skillIds = skillsWithTag.map(skill => skill._id);

        // Find listings that reference these skills
        const listings = await SkillListing.find({ skillID: { $in: skillIds } })
            .populate('teacherID', 'fullname email profile.profilePhoto')
            .populate('skillID', 'name tags');
            
        const count = listings.length; // Get the count of listings
        return res.status(200).json({
            message: "Skill listings retrieved successfully",
            success: true,
            listings,
            count
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Get all tags from skill listings with counts
export const getAllTagsFromListings = async (req, res) => {
    try {
        const listings = await SkillListing.find().populate('skillID', 'tags');
        const tagCounts = new Map();

        listings.forEach(listing => {
            if (listing.skillID && listing.skillID.tags) {
                listing.skillID.tags.forEach(tag => {
                    // Normalize tag by converting to lowercase for comparison
                    const normalizedTag = tag.toLowerCase();
                    
                    // If we've seen this tag before (case-insensitive), increment count
                    let existingEntry = null;
                    for (let [existingTag, data] of tagCounts.entries()) {
                        if (existingTag.toLowerCase() === normalizedTag) {
                            existingEntry = existingTag;
                            break;
                        }
                    }
                    
                    if (existingEntry) {
                        // Increment count for existing tag
                        tagCounts.get(existingEntry).count++;
                    } else {
                        // Use proper case version (capitalize first letter)
                        const properCaseTag = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
                        tagCounts.set(properCaseTag, { count: 1 });
                    }
                });
            }
        });

        // Convert Map to array with tag and count
        const tagsWithCounts = Array.from(tagCounts.entries()).map(([tag, data]) => ({
            tag: tag,
            count: data.count
        }));

        // Sort by count (descending) then by tag name (ascending)
        tagsWithCounts.sort((a, b) => {
            if (b.count !== a.count) {
                return b.count - a.count;
            }
            return a.tag.localeCompare(b.tag);
        });

        return res.status(200).json({
            message: "Tags with counts retrieved successfully",
            success: true,
            tags: tagsWithCounts,
            totalUniqueTags: tagsWithCounts.length
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};