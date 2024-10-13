"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.deleteUser = exports.getAllUsers = void 0;
const users_1 = require("../models/users");
const getAllUsers = async (req, res) => {
    try {
        const users = await (0, users_1.getUsers)();
        return res.status(200).json(users);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
};
exports.getAllUsers = getAllUsers;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await (0, users_1.deleteUserById)(id);
        return res.status(200).json(deletedUser);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
};
exports.deleteUser = deleteUser;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username } = req.body;
        if (!username) {
            return res.sendStatus(400);
        }
        const user = await (0, users_1.getUserById)(id);
        user.username = username;
        await user.save();
        return res.status(200).json(user);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
};
exports.updateUser = updateUser;
//# sourceMappingURL=users.js.map