import bcrypt from "bcryptjs";
import User from "../models/user";
import { where } from "sequelize";
import { raw } from "body-parser";

const salt = bcrypt.genSaltSync(10);

let createNewUser = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPasswordFromBcrypt = await hashUserPassword(data.password);

      await User.create({
        email: data.email,
        password: hashPasswordFromBcrypt,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        phoneNumber: data.phoneNumber,
        gender: data.gender === "1" ? true : false,
        roleId: data.roleId,
        image: null,
        positionId: null,
      });
      resolve("OK create a new user successful");
    } catch (e) {
      console.log("---!!! ERROR in createNewUser service !!!---");
      console.log(e);
      reject(e); // Then reject
    }
  });
};

let hashUserPassword = (password) => {
  return new Promise((resolve, reject) => {
    try {
      let hashPassword = bcrypt.hashSync(password, salt);
      resolve(hashPassword);
    } catch (e) {
      reject(e);
    }
  });
};

let getAllUsers = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await User.find({});
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};

let getUserInfoById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await User.findById(userId);
      if (user) {
        resolve(user);
      } else {
        resolve({});
      }
    } catch (e) {
      reject(e);
    }
  });
};

let updateUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      await User.findByIdAndUpdate(data.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
      });

      let allusers = await User.find({});
      resolve(allusers);
    } catch (e) {
      reject(e);
    }
  });
};

let deleteUserById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      await User.findByIdAndDelete(userId);
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createNewUser: createNewUser,
  getAllUsers: getAllUsers,
  getUserInfoById: getUserInfoById,
  updateUser: updateUser,
  deleteUserById: deleteUserById,
};
