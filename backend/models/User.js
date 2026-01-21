import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function () { return !this.googleId; } // Password required if not Google Auth
    },
    googleId: {
        type: String
    },
    resumeText: {
        type: String // Raw text from resume
    },
    // We will store extracted profile details here
    profile: {
        role: String,
        skills: [String],
        experience: [{
            title: String,
            company: String,
            duration: String,
            description: String
        }],
        education: [{
            degree: String,
            institution: String,
            year: String
        }],
        projects: [{
            title: String,
            description: String,
            techStack: [String]
        }],
        internships: [{
            title: String,
            company: String,
            duration: String,
            description: String
        }],
        contact: {
            email: String,
            phone: String,
            linkedin: String,
            github: String,
            location: String
        },
        hobbies: [String],
        summary: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
