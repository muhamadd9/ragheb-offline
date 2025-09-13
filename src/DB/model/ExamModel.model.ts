import { DataTypes } from "sequelize";
import { sequelize } from "../dbConfig";
import Exam from "./Exam.model";

const ExamModel = sequelize.define(
    "ExamModel",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        exam_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: { model: "exams", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        model_number: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        model_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        solution_photo: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    { tableName: "exam_models", indexes: [{ name: "idx_exam_models_exam", fields: ["exam_id"] }] }
);

ExamModel.belongsTo(Exam, { foreignKey: "exam_id" });
Exam.hasMany(ExamModel, { foreignKey: "exam_id" });

export default ExamModel;


