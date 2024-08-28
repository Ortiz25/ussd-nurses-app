import * as dotenv from "dotenv";
dotenv.config();
import { Sequelize, DataTypes } from "sequelize";

// mysql Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.MYSQLDB_HOST,
    dialect: "mysql",
    port: process.env.PORT,
  }
);

export const Nurse = sequelize.define("Nurse", {
  nurse_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  registration_no: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  index_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  id_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  registration_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  dob: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
  },
  tracking_number: {
    type: DataTypes.STRING,
  },
  private_practice_license_ready: {
    type: DataTypes.BOOLEAN,
  },
  registration_certificate_ready: {
    type: DataTypes.BOOLEAN,
  },
  timestamps: false,
});

export const Institution = sequelize.define("Institution", {
  institution_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  institution_name: {
    type: DataTypes.STRING,
  },
  approved: {
    type: DataTypes.BOOLEAN,
  },
  location: {
    type: DataTypes.STRING,
  },
  contact_details: {
    type: DataTypes.STRING,
  },
  timestamps: false,
});

export const NCK_Office = sequelize.define("NCK_Office", {
  office_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  office_name: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
  },
  contact_details: {
    type: DataTypes.STRING,
  },
  timestamps: false,
});

export const Payment = sequelize.define("Payment", {
  payment_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nurse_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Nurse,
      key: "nurse_id",
    },
  },
  payment_amount: {
    type: DataTypes.DECIMAL(10, 2),
  },
  payment_date: {
    type: DataTypes.DATE,
  },
  renewal_date: {
    type: DataTypes.DATE,
  },
  payment_reference: {
    type: DataTypes.STRING,
  },
  timestamps: false,
});

export const Exam = sequelize.define("Exam", {
  exam_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  exam_name: {
    type: DataTypes.STRING,
  },
  exam_date: {
    type: DataTypes.DATE,
  },
  location: {
    type: DataTypes.STRING,
  },
  application_deadline: {
    type: DataTypes.DATE,
  },
  release_date: {
    type: DataTypes.DATE,
  },

  timestamps: false,
});

// Assuming the models are imported correctly
Nurse.hasMany(Payment, { foreignKey: "nurse_id" });
Payment.belongsTo(Nurse, { foreignKey: "nurse_id" });
