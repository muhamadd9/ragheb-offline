import { DataTypes } from "sequelize";
import { sequelize } from "../dbConfig";

const Student = sequelize.define(
    "Student",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        student_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            unique: true,
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: true,
            validate: { isEmail: true },
        },
        phone_number: {
            type: DataTypes.STRING(30),
            allowNull: false,
            // unique: true,
        },
        guardian_number: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        birth_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        national_id: {
            type: DataTypes.STRING(40),
            allowNull: true,
        },
        gender: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        level: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        school_name: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        is_subscription: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        subscription_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        // fingerprint_template: {
        //     type: DataTypes.TEXT,
        //     allowNull: true,
        // },
        uid: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        // months_without_payment: {
        //     type: DataTypes.INTEGER.UNSIGNED,
        //     allowNull: false,
        //     defaultValue: 0,
        // },
        archived: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        blocked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        group_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: { model: "groups", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
    },
    {
        tableName: "students",
        indexes: [
            { name: "idx_students_name", fields: ["first_name", "last_name"] },
            { name: "idx_students_phone", fields: ["phone_number"] },
            { name: "idx_students_first_name", fields: ["first_name"] },
            { name: "idx_students_last_name", fields: ["last_name"] },
            { name: "idx_students_level", fields: ["level"] },
            { name: "idx_students_uid", fields: ["uid"] },
            { name: "idx_students_archived", fields: ["archived"] },
            { name: "idx_students_group_id", fields: ["group_id"] },
        ],
    }
);

export default Student;


