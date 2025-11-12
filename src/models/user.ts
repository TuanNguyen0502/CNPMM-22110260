"use strict";

import { Model, DataTypes, Sequelize } from "sequelize";

// Interface for User attributes
interface UserAttributes {
  id?: number;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  gender: boolean;
  image: string;
  roleId: string;
  positionId: string;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public address!: string;
  public phoneNumber!: string;
  public gender!: boolean;
  public image!: string;
  public roleId!: string;
  public positionId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    // define association here
  }
}

module.exports = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      address: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      gender: DataTypes.BOOLEAN,
      image: DataTypes.STRING,
      roleId: DataTypes.STRING,
      positionId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
    }
  );
  return User;
};
