const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');

// [POST]/users/register
module.exports.register = async (req, res) => {
    try {
        const existEmail = await User.findOne({
            email: req.body.email
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