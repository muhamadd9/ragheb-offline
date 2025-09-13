import { DataTypes } from "sequelize";
import { sequelize } from "../dbConfig";

export const Roles = ["admin", "assistant"] as const;
export type Role = typeof Roles[number];

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    blocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    role: {
      type: DataTypes.ENUM(...(Roles as readonly string[])),
      allowNull: false,
      defaultValue: "assistant",
    },
  },
  {
    tableName: "users",
    indexes: [{ name: "idx_users_name", fields: ["name"] }],
  }
);

export default User;
