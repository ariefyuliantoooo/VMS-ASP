const { WorkPermit, Visit, User } = require('../models');

// Create Work Permit
exports.createPermit = async (req, res) => {
  try {
    const { visitor_id, worker_name, company, job_type, work_location, start_date, end_date, pic_company } = req.body;
    
    let permit_file = null;
    if (req.file) {
      permit_file = req.file.path.split('public')[1].replace(/\\/g, '/'); // Get relative web path
    }

    // Verify visit exists
    const visit = await Visit.findByPk(visitor_id);
    if (!visit) {
        return res.status(404).json({ message: 'Visit not found. Work Permit must be linked to a valid visit.' });
    }

    const newPermit = await WorkPermit.create({
      visitor_id,
      worker_name,
      company,
      job_type,
      work_location,
      start_date,
      end_date,
      pic_company,
      permit_file
    });

    res.status(201).json({
      message: 'Work permit created successfully',
      permit: newPermit
    });
  } catch (error) {
    console.error('Create Permit Error:', error);
    res.status(500).json({ message: 'Error creating work permit', error: error.message });
  }
};

// Get all work permits
exports.getAllPermits = async (req, res) => {
  try {
    const permits = await WorkPermit.findAll({
      include: [{ 
        model: Visit, 
        attributes: ['full_name', 'visit_purpose', 'visit_date', 'status'],
        include: [{ model: User, attributes: ['username']}]
      }],
      order: [['created_at', 'DESC']]
    });
    res.json(permits);
  } catch (error) {
    console.error('Get Permits Error:', error);
    res.status(500).json({ message: 'Error fetching work permits', error: error.message });
  }
};
