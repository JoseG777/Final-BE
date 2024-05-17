const Sequelize = require("sequelize");
const db = require("../db");

const Student = db.define("student", {
  firstname: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: { notEmpty: true },
  },

  lastname: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: { notEmpty: true },
  },

  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: { notEmpty: true },
  },

  imageUrl: {
    type: Sequelize.STRING,
    defaultValue: "https://via.placeholder.com/150",
  },

  gpa: {
    type: Sequelize.DECIMAL(2, 1),
    allowNull: true,
    validate: {
      min: 0.0,
      max: 4.0,
    },
  },
});

module.exports = Student;
