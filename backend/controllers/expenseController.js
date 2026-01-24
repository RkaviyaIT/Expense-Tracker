const Expense = require("../models/Expense");
const xlsx = require("xlsx");

// Add expense Source
exports.addExpense = async (req, res) => {
    const userId=req.user.id;
  try {
    const { icon,category,amount,date} = req.body;
    const newExpense = new Expense({
        icon,  
        amount,
        category,
        date: new Date(date),
        userId,
    });

    await newExpense.save();
    res.status(201).json({ message: "expense added successfully", expense: newExpense });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get All expense Source
exports.getAllexpense = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete expense Source
exports.deleteexpense = async (req, res) => {
    try{
      await Expense.findByIdAndDelete(req.params.id);
      res.json({message:"expense deleted successfully"});
    }catch(error){
      res.status(500).json({message:"server error"});
    }
};

// Download Excel (Placeholder logic)
exports.downloadexpenseExcel = async (req, res) => {
  const userId=req.user.id;
  try {
    // Logic for generating Excel file would go here (e.g., using exceljs or xlsx)
    const expenses =await Expense.find({userId}).sort({date:-1});

    const data=expenses.map((item)=>({
      Category:item.category,
      Amount:item.amount,
      Date:item.date,

    }));
    const wb=xlsx.utils.book_new();
    const ws=xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb,ws,"Expense");

    // Write to buffer instead of file
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="Expense_Details.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};