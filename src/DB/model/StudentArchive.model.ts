import { DataTypes } from "sequelize";
import { sequelize } from "../dbConfig";
import Student from "./Student.model";
import User from "./User.model";

const StudentArchive = sequelize.define(
    "StudentArchive",
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
            allowNull: true,
        },
        archived_by: {
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
        tableName: "student_archives",
        indexes: [
            { name: "idx_student_archives_student", fields: ["student_id"] },
            { name: "idx_student_archives_archived_by", fields: ["archived_by"] },
        ],
    }
);

StudentArchive.belongsTo(Student, { foreignKey: "student_id" });
Student.hasMany(StudentArchive, { foreignKey: "student_id" });

StudentArchive.belongsTo(User, { foreignKey: "archived_by" });
User.hasMany(StudentArchive, { foreignKey: "archived_by" });

export default StudentArchive;


