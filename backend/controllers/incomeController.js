const User = require("../models/User");
const Income = require("../models/Income"); // Changed from User to Income
const xlsx = require("xlsx");

// Add Income Source
exports.addIncome = async (req, res) => {
  try {
    const { icon,category,amount,date} = req.body;
    const income = new Income({
      icon,
      amount,
      category,
      date: new Date(date),
      userId: req.user.id,
    });

    await income.save();
    res.status(201).json({ message: "Income added successfully", income });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get All Income Source
exports.getAllIncome = async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete Income Source
exports.deleteIncome = async (req, res) => {
    try{
      await Income.findByIdAndDelete(req.params.id);
      res.json({message:"Income deleted successfully"});
    }catch(error){
      res.status(500).json({message:"server error"});
    }
};

// Download Excel (Placeholder logic)
exports.downloadIncomeExcel = async (req, res) => {
  const userId=req.user.id;
  try {
    // Logic for generating Excel file would go here (e.g., using exceljs or xlsx)
    const income =await Income.find({userId}).sort({date:-1});

    const data=income.map((item)=>({
      Category:item.category,
      Amount:item.amount,
      Date:item.date,

    }));
    const wb=xlsx.utils.book_new();
    const ws=xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb,ws,"Income");

    // Write to buffer instead of file
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="Income_Details.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};