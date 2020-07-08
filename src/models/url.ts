import mongoose, {Schema, Model, Document} from "mongoose"


const urlSchema: Schema<any> = new Schema({
    hash: {
        type: String,
        unique: true
    },
    orgUrl: String,
    shortenedUrl: String,
    visits: {
        type: Number,
        default: 0
    }
})

const Url: Model<Document, {}> = mongoose.model("Url", urlSchema);


export default Url