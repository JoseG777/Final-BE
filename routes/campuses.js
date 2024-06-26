/*==================================================
/routes/campuses.js

It defines all the campuses-related routes.
==================================================*/
// Import Express module
const express = require('express');
// Create an Express router function called "router"
const router = express.Router();
// Import database models
const { Student, Campus } = require('../database/models');

// Import a middleware to replace "try and catch" for request handler, for a concise coding (fewer lines of code)
const ash = require('express-async-handler');

/* GET ALL CAMPUSES: async/await using "try-catch" */
// router.get('/', async (req, res, next) => {
//   try {
//     let campuses = await Campus.findAll({include: [Student]});
//     res.status(200).json(campuses);
//   } 
//   catch(err) {
//     next(err);
//   }
// });

/* GET ALL CAMPUSES */
router.get('/', ash(async(req, res) => {
  let campuses = await Campus.findAll({include: [Student]});  // Get all campuses and their associated students
  res.status(200).json(campuses);  // Status code 200 OK - request succeeded
}));

/* GET CAMPUS BY ID */
router.get('/:id', ash(async(req, res) => {
  // Find campus by Primary Key
  let campus = await Campus.findByPk(req.params.id, {include: [Student]});  // Get the campus and its associated students
  res.status(200).json(campus);  // Status code 200 OK - request succeeded
}));

/* DELETE CAMPUS */
router.delete('/:id', ash(async(req, res) => {
  try {
      const numDestroyed = await Campus.destroy({
          where: { id: req.params.id }
      });
      if (numDestroyed) {
          res.status(200).json({ message: "Campus deleted successfully." });
      } else {
          res.status(404).json({ error: "Campus not found." });
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}));

/* ADD NEW CAMPUS */
router.post('/', ash(async(req, res) => {
  let newCampus = await Campus.create(req.body);
  res.status(200).json(newCampus);  // Status code 200 OK - request succeeded
}));

/* EDIT CAMPUS */
router.put('/:id', ash(async(req, res) => {
  try {
    const updates = req.body;

    const updated = await Campus.update(updates, {
      where: { id: req.params.id },
      returning: true, 
    });

    if (updated && updated[0] > 0) {
      const updatedCampus = updated[1][0]; 
      res.status(201).json(updatedCampus);
    } else {
      res.status(404).json({ message: 'Campus not found or no changes provided' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

/* ADD STUDENT TO CAMPUS */
router.post('/:id/students', ash(async (req, res) => {
  const { id } = req.params; 
  const studentData = req.body;

  const campus = await Campus.findByPk(id);
  if (!campus) {
    return res.status(404).json({ message: 'Campus not found' });
  }

  let student = await Student.findOne({ where: { email: studentData.email } });

  if (student) {
    if (student.campusId) {
      return res.status(400).json({ message: 'Student is already enrolled in a campus' });
    }
    student.campusId = id;
    await student.save();
    res.status(200).json(student);
  } else {
    const newStudent = await Student.create({ ...studentData, campusId: id });
    res.status(201).json(newStudent);
  }
}));


/* REMOVE STUDENT FROM CAMPUS */
router.delete('/:campusId/students/:studentId', ash(async (req, res) => {
  try {
    const { campusId, studentId } = req.params;
    const student = await Student.findOne({
      where: {
        id: studentId,
        campusId: campusId 
      }
    });

    if (student) {
      student.campusId = null;
      await student.save();

      res.status(200).json({ message: "Student removed from campus successfully." });
    } else {
      res.status(404).json({ message: "No student found with the provided ID on the specified campus." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));



// Export router, so that it can be imported to construct the apiRouter (app.js)
module.exports = router;