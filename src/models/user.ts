import mongoose, {Schema, Model} from "mongoose";


const userSchema: Schema<any> = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    pwd: String,
    urls: [{
        type: mongoose.Schema.Types.ObjectId, ref: "Url"
    }],
    approved: {
        type: Boolean,
        default: false
    },
    resetToken: String,
    name: String,
    role: String,
    joinedDate: Date
})

const User: Model<mongoose.Document, {}> = mongoose.model("User", userSchema);


export default User