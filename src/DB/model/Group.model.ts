import { DataTypes } from "sequelize";
import { sequelize } from "../dbConfig";

export const DayOfWeek = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
] as const;
export type DayOfWeek = typeof DayOfWeek[number];

const Group = sequelize.define(
    "Group",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        group_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        start_time: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        level: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            validate: { min: 1, max: 3 },
        },
        days: {
            type: DataTypes.JSON,
            allowNull: false,
            get() {
                const raw = this.getDataValue("days") as string[] | null;
                return raw || [];
            },
            set(value: DayOfWeek[]) {
                const filtered = (value || []).filter((v) => (DayOfWeek as readonly string[]).includes(v));
                this.setDataValue("days", filtered);
            },
            validate: {
                isValidArray(value: unknown) {
                    if (!Array.isArray(value)) throw new Error("days must be an array");
                    for (const v of value) {
                        if (!(DayOfWeek as readonly string[]).includes(v)) {
                            throw new Error(`Invalid day: ${v}`);
                        }
                    }
                },
            },
        },
    },
    {
        tableName: "groups",
        indexes: [
            { name: "idx_groups_name", fields: ["group_name"] },
            { name: "idx_groups_level", fields: ["level"] },
        ],
    }
);

export default Group;


