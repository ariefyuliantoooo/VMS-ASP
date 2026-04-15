const { Visit, User, WorkPermit, sequelize } = require('../models');
const { Op } = require('sequelize');
const QRCode = require('qrcode');
const crypto = require('crypto');

// Create a new visit
exports.createVisit = async (req, res) => {
  try {
    const { full_name, company, phone, visit_purpose, person_to_meet, visit_date } = req.body;
    const user_id = req.user.id; // From auth middleware

    // Generate unique ID for QR Code
    const uniqueId = crypto.randomUUID();
    
    // Create QR Code image data URI
    const qrCodeDataUri = await QRCode.toDataURL(uniqueId);

    const newVisit = await Visit.create({
      user_id,
      full_name,
      company,
      phone,
      visit_purpose,
      person_to_meet,
      visit_date,
      qr_code: uniqueId // We store the unique string, frontend logic or backend will serve the image
    });

    res.status(201).json({
      message: 'Visit registered successfully',
      visit: newVisit,
      qrCodeImage: qrCodeDataUri // Send the image data UI back directly to the client
    });

  } catch (error) {
    console.error('Create Visit Error:', error);
    res.status(500).json({ message: 'Error creating visit', error: error.message });
  }
};

// Get all visits (for security dashboard or admin)
exports.getAllVisits = async (req, res) => {
  try {
    const visits = await Visit.findAll({
      include: [
        { model: User, attributes: ['username', 'email'] },
        { model: WorkPermit }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visits', error: error.message });
  }
};

// Get visits for logged-in user
exports.getUserVisits = async (req, res) => {
  try {
    const { id, role, full_name } = req.user;
    
    let whereClause = { user_id: id };
    
    // If Staff, only show visits where they are the person to meet 
    // to search for the one they want to link a permit to.
    if (role === 'STAFF') {
        whereClause = { 
            person_to_meet: { [Op.iLike]: `%${full_name}%` }
        };
    } else if (role === 'SECURITY' || role === 'ADMIN') {
        // Security and Admin see all
        whereClause = {};
    }

    const visits = await Visit.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user visits', error: error.message });
  }
};

// Get visit by ID
exports.getVisitById = async (req, res) => {
  try {
    const { id } = req.params;
    const visit = await Visit.findByPk(id, {
      include: [{ model: User, attributes: ['username', 'email'] }]
    });

    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    
    // Also regenerate the QR image to send
    const qrCodeDataUri = await QRCode.toDataURL(visit.qr_code);

    res.json({
      visit,
      qrCodeImage: qrCodeDataUri
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visit Details', error: error.message });
  }
};

// Scan QR code / Update Status (Security Guard Action)
exports.scanVisit = async (req, res) => {
  try {
    const { qr_code } = req.body;
    
    const visit = await Visit.findOne({ where: { qr_code } });
    if (!visit) {
      return res.status(404).json({ message: 'Invalid QR Code. Visit not found.' });
    }

    // Toggle status or move it forward
    let newStatus = 'CHECKED_IN';
    if (visit.status === 'PENDING') {
      newStatus = 'CHECKED_IN';
    } else if (visit.status === 'CHECKED_IN') {
      newStatus = 'CHECKED_OUT';
    } else {
      return res.status(400).json({ message: 'Visitor has already checked out', visit });
    }

    visit.status = newStatus;
    await visit.save();

    res.json({
      message: `Visitor successfully ${newStatus === 'CHECKED_IN' ? 'checked in' : 'checked out'}`,
      visit
    });
  } catch (error) {
    res.status(500).json({ message: 'Error scanning QR Code', error: error.message });
  }
};

// Delete visit (Admin action)
exports.deleteVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const visit = await Visit.findByPk(id);
    
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    await visit.destroy();
    res.json({ message: 'Visit successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting visit', error: error.message });
  }
};
