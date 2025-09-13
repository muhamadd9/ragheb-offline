import { DataTypes } from "sequelize";
import { sequelize } from "../dbConfig";

const Book = sequelize.define(
    "Book",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    { tableName: "books", indexes: [{ name: "idx_books_name", fields: ["name"] }] }
);

export default Book;


