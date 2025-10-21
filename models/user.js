import mongoose from 'mongoose';

const user = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true },
    consent_to_terms_data_use: { type: Boolean, required: true },
    preffered_language: { type: String },
    country: { type: String },
    //password reset data
    verifyOtp: { type: Number, default: '' },
    verifyOtpExpires: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: Number, default: '' },
    resetOtpExpires: { type: Number, default: 0 },

    //
    authentication: {
        password: { type: String, required: true, select: false },
        salt: { type: String, select: false },
        sessionToken: { type: String, select: false },
    },

},
    { timestamps: true }
)

export const userModel = mongoose.model('users', user);

//user accessors
export const getUserByEmail = (email) => userModel.findOne({ email });

export const getUserById = (id) => userModel.findById(id);

export const getUserBySessionToken = (sessionToken) =>
    userModel.findOne({
        "authentication.sessionToken": sessionToken,
    });

export const createUser = (values) =>
    new userModel(values).save().then((user) => user.toObject());

export const getUsers = () => UserModel.find();

export const updateUser = (id, values) =>
    userModel.findOneAndUpdate({ _id: id }, values, { new: true });

export const getUser = () => userModel.findOne();

export const deleteUserById = (id) => userModel.findOneAndDelete({ _id: id });