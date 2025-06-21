// models/skills.js

import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    category: {
        type: String,
        default: '',
    },
    tags: [{
        type: String,
    },],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // optional: if an admin or teacher created it
    },
},
{ timestamps: true }
);

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
