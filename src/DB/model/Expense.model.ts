import { DataTypes } from "sequelize";
import { sequelize } from "../dbConfig";
import User from "./User.model";

const Expense = sequelize.define(
    "Expense",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: { model: "users", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    { tableName: "expenses", indexes: [{ name: "idx_expenses_user", fields: ["user_id"] }] }
);

Expense.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Expense, { foreignKey: "user_id" });

export default Expense;


