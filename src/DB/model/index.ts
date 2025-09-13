import { sequelize } from "../dbConfig";
import Student from "./Student.model";
import Group from "./Group.model";
import Book from "./Book.model";
import Sale from "./Sale.model";
import Expense from "./Expense.model";
import StudentBlock from "./StudentBlock.model";
import StudentArchive from "./StudentArchive.model";
import Exam from "./Exam.model";
import ExamModel from "./ExamModel.model";
import Attendance from "./Attendance.model";
import User from "./User.model";

// Associations
Group.hasMany(Student, { foreignKey: "group_id", as: "students" });
Student.belongsTo(Group, { foreignKey: "group_id", as: "group" });

// Attendance associations
Group.hasMany(Attendance, { foreignKey: "group_id", as: "attendance" });
Attendance.belongsTo(Group, { foreignKey: "group_id", as: "group" });

Student.hasMany(Attendance, { foreignKey: "student_id", sourceKey: "student_id", as: "attendance" });
Attendance.belongsTo(Student, { foreignKey: "student_id", targetKey: "student_id", as: "student" });

User.hasMany(Attendance, { foreignKey: "recorded_by", as: "recordedAttendance" });
Attendance.belongsTo(User, { foreignKey: "recorded_by", as: "recordedBy" });

export const initModels = async () => {
    console.log("[Sequelize] Models initialized.");
    if (process.env.DB_AUTO_SYNC === "true") {
        console.log("[Sequelize] Safe sync started (force: false, alter: true)...");
        await sequelize.sync({ force: false, alter: true });
        console.log("[Sequelize] Safe sync completed.");
    } else {
        console.log("[Sequelize] Skipping auto sync. Set DB_AUTO_SYNC=true to enable.");
    }
    return { Student, Group, Book, Sale, Expense, StudentBlock, StudentArchive, Exam, ExamModel, Attendance, User };
};

export { Student, Group, Book, Sale, Expense, StudentBlock, StudentArchive, Exam, ExamModel, Attendance, User };


