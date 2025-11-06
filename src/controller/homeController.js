import db from "../models/user.js";
import CRUDService from "../services/CRUDService";

let getHomePage = async (req, res) => {
  try {
    let data = await db.User.findAll();
    return res.render("homePage.ejs", {
      data: JSON.stringify(data),
    });
  } catch (e) {
    console.log(e);
  }
};

let getAboutPage = (req, res) => {
  return res.render("test/about.ejs");
};

let getCRUD = (req, res) => {
  return res.render("crud.ejs");
};

let getFindAllCrud = async (req, res) => {
  let data = await CRUDService.getAllUsers();
  return res.render("users/findAllUser.ejs", {
    datalist: data,
  });
};

let postCRUD = async (req, res) => {
  try {
    let message = await CRUDService.createNewUser(req.body);
    console.log(message);
    return res.send("Post crud to server");
  } catch (e) {
    console.log("---!! POSTCRUD CONTROLLER FAILED !!---");
    console.log(e);
    return res.status(500).send("Server error: Could not create user.");
  }
};

let getEditCRUD = async (req, res) => {
  let userId = req.query.id;
  if (userId) {
    let userData = await CRUDService.getUserInfoById(userId);
    return res.render("users/updateUser.ejs", {
      data: userData,
    });
  } else {
    return res.send("User not found!");
  }
};

let putCRUD = async (req, res) => {
  let data = req.body;
  let data1 = await CRUDService.updateUser(data);
  return res.render("users/findAllUser.ejs", {
    datalist: data1,
  });
};

let deleteCRUD = async (req, res) => {
  let userId = req.query.id;
  if (userId) {
    await CRUDService.deleteUserById(userId);
    return res.send("Delete user successfully!");
  } else {
    return res.send("User not found!");
  }
};

module.exports = {
  getHomePage,
  getAboutPage,
  getCRUD,
  postCRUD,
  getFindAllCrud,
  getEditCRUD,
  putCRUD,
  deleteCRUD,
};
