import { DataTypes } from "sequelize";
import { sequelize } from "../dbConfig";
import Student from "./Student.model";
import User from "./User.model";

const StudentBlock = sequelize.define(
    "StudentBlock",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        student_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: { model: "students", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        blocked_by: {
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
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: "student_blocks",
        indexes: [
            { name: "idx_student_blocks_student", fields: ["student_id"] },
            { name: "idx_student_blocks_blocked_by", fields: ["blocked_by"] },
        ],
    }
);

StudentBlock.belongsTo(Student, { foreignKey: "student_id" });
Student.hasMany(StudentBlock, { foreignKey: "student_id" });

StudentBlock.belongsTo(User, { foreignKey: "blocked_by" });
User.hasMany(StudentBlock, { foreignKey: "blocked_by" });

export default StudentBlock;


