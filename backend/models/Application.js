import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    job: {
        jobId: String,
        title: String,
        company: String,
        location: String,
        salary: String,
        url: String,
        description: String
    },
    status: {
        type: String,
        enum: ['Applied', 'Interview', 'Offer', 'Rejected'],
        default: 'Applied'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    notes: String
});

applicationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;
