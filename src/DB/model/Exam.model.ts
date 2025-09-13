import { DataTypes } from "sequelize";
import { sequelize } from "../dbConfig";

const Exam = sequelize.define(
    "Exam",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        exam_name: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        exam_level: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        exam_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        exam_start_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        solution_photo: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        final_degree: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    { tableName: "exams", indexes: [{ name: "idx_exams_level", fields: ["exam_level"] }] }
);

export default Exam;


