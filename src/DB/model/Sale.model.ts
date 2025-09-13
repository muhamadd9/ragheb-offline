import { DataTypes } from "sequelize";
import { sequelize } from "../dbConfig";
import Book from "./Book.model";

export const SaleTypes = ["book", "month"] as const;
export type SaleType = typeof SaleTypes[number];

const Sale = sequelize.define(
    "Sale",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        student_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM(...(SaleTypes as readonly string[])),
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        sub_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        book_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: { model: "books", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        month: {
            type: DataTypes.TINYINT,
            allowNull: true,
        },
        year: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    { tableName: "sales", indexes: [{ name: "idx_sales_student", fields: ["student_id"] }] }
);

Sale.belongsTo(Book, { foreignKey: "book_id" });
Book.hasMany(Sale, { foreignKey: "book_id" });

export default Sale;


