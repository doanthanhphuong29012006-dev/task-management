const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');
const ForgotPassword = require('../models/forgot-password.model');

const generateHelper = require('../../../helpers/generate');
const sendMailHelper = require('../../../helpers/sendMail');

// [POST] /api/v1/users/register
module.exports.register = async (req, res) => {
    try {
        const existEmail = await User.findOne({
            email: req.body.email,
            deleted: false
        });

        if (existEmail) {
            return res.status(400).json({
                message: "Email đã tồn tại!"
            });
        } 
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);

        req.body.password = hash;

        const user = new User({
            email: req.body.email,
            fullName: req.body.fullName,
            password: req.body.password
        });

        await user.save();

        const payload = {
            userId: user.id,
            email: user.email
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Đăng ký tài khoản thành công!",
            token: token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi server!"
        });
    }
}

// [POST] /api/v1/users/login
module.exports.login = async (req, res) => {
    try {
        const email = req.body.email;
    
        const user = await User.findOne({
            email: email,
            deleted: false
        });

        if (!user) {
            return res.status(400).json({
                message: "Email hoặc mật khẩu không chính xác!"
            });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Email hoặc mật khẩu không chính xác!"
            });
        }

        const payload = {
            userId: user.id,
            email: email
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Đăng nhập thành công!",
            token: token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi server!"
        });
    }
}

// [POST] /api/v1/users/password/forgot
module.exports.forgotPassword = async (req, res) => {
    try {
        const email = req.body.email;

        const user = await User.findOne({
            email: email,
            deleted: false
        });

        if (!user) {
            return res.status(400).json({
                message: "Email không tồn tại!"
            });
        }

        const otp = generateHelper.generateRandomNumber(6);

        const objectForgotPassword = {
            email: email,
            otp: otp,
            expiresAt: Date.now()
        };

        const subject = "Mã OTP lấy lại mật khẩu";
        const html = `
            <h2>Xin chào ${user.fullName}!</h2>
            <p>Bạn đã yêu cầu lấy lại mật khẩu. Mã OTP của bạn là: <b style="font-size: 20px; color: blue;">${otp}</b></p>
            <p>Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        `;
        
        sendMailHelper.sendMail(email, subject, html);

        const forgotPassword = new ForgotPassword(objectForgotPassword);
        await forgotPassword.save();

        res.status(200).json({
            message: "Đã gửi OTP qua email!"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi server!"
        });
    }
}

// [POST] /api/v1/users/password/otp
module.exports.otpPassword = async (req, res) => {
    try {
        const email = req.body.email;
        const otp = req.body.otp;

        const result = await ForgotPassword.findOne({
            email: email,
            otp: otp
        });

        if (!result) {
            return res.status(400).json({
                message: "Mã OTP không hợp lệ"
            });
        }

        const user = await User.findOne({
            email: email,
            deleted: false
        });

        await ForgotPassword.deleteOne({ _id: result.id });

        const payload = {
            userId: user.id,
            email: email
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Xác thực thành công!",
            token: token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi server!"
        });
    }
}

// [POST] /api/v1/users/password/reset
module.exports.resetPassword = async (req, res) => {
    try {
        const password = req.body.password;

        const user = await User.findOne({
            _id: req.user.userId,
            deleted: false
        });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            return res.status(400).json({
                message: "Vui lòng nhập mật khẩu mới khác mật khẩu cũ!"
            });
        }

        await User.updateOne({
            _id: req.user.userId,
            deleted: false
        }, {
            password: hash
        });

        res.status(200).json({
            message: "Đổi mật khẩu thành công!"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi server!"
        });
    }
}

// [GET] /api/v1/users/detail
module.exports.detail = async (req, res) => {
    const user = await User.findOne({
        _id: req.user.userId,
        deleted: false
    }).select("-password");

    res.status(200).json({
        message: "Thành công",
        info: user
    });
}