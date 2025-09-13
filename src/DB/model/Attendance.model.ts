import { DataTypes } from "sequelize";
import { sequelize } from "../dbConfig";

export const AttendanceStatus = ["present", "absent"] as const;
export type AttendanceStatus = typeof AttendanceStatus[number];

const Attendance = sequelize.define(
    "Attendance",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        group_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: { model: "groups", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        student_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: { model: "students", key: "student_id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        attendance_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...(AttendanceStatus as readonly string[])),
            allowNull: false,
        },
        recorded_by: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: { model: "users", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        recorded_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "attendance",
        indexes: [
            { name: "idx_attendance_group_id", fields: ["group_id"] },
            { name: "idx_attendance_student_id", fields: ["student_id"] },
            { name: "idx_attendance_date", fields: ["attendance_date"] },
            { name: "idx_attendance_status", fields: ["status"] },
            { name: "idx_attendance_recorded_by", fields: ["recorded_by"] },
            { name: "idx_attendance_group_student_date", fields: ["group_id", "student_id", "attendance_date"], unique: true },
        ],
    }
);

export default Attendance;
