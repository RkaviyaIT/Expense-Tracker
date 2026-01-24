const express = require("express");
const {
  addExpense,
  getAllexpense,
  deleteexpense,
  downloadexpenseExcel
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addExpense);
router.get("/get", protect, getAllexpense);
router.get("/downloadexcel", protect,downloadexpenseExcel);
router.delete("/:id", protect, deleteexpense);

module.exports = router;