const { Visit, User, WorkPermit, sequelize } = require('../models');
const { Op } = require('sequelize');
const QRCode = require('qrcode');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

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

    // Attempt to find the PIC to notify them (removed for initial request as per new simplified flow)
    // The PIC will only be notified when the user actually checks in at the lobby.

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

// Create a public visit (Guest registration)
exports.createPublicVisit = async (req, res) => {
  try {
    const { full_name, company, phone, visit_purpose, person_to_meet, visit_date } = req.body;

    // Generate unique ID for QR Code
    const uniqueId = crypto.randomUUID();
    
    // Create QR Code image data URI
    const qrCodeDataUri = await QRCode.toDataURL(uniqueId);

    const newVisit = await Visit.create({
      user_id: null, // Guest
      full_name,
      company,
      phone,
      visit_purpose,
      person_to_meet,
      visit_date,
      qr_code: uniqueId
    });

    res.status(201).json({
      message: 'Guest visit registered successfully',
      visit: newVisit,
      qrCodeImage: qrCodeDataUri
    });

  } catch (error) {
    console.error('Create Public Visit Error:', error);
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

// Get visit by QR code (without mutating status)
exports.getVisitByQR = async (req, res) => {
  try {
    const { code } = req.params;
    const visit = await Visit.findOne({ 
        where: { qr_code: code },
        include: [{ model: User, attributes: ['username', 'email'] }]
    });

    if (!visit) {
      return res.status(404).json({ message: 'Invalid QR Code. Visit not found.' });
    }

    res.json({ visit });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visit by QR', error: error.message });
  }
};

// Update visit status (Approve/Reject by PIC)
exports.updateVisitStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g., 'APPROVED', 'REJECTED'

        const visit = await Visit.findByPk(id);
        if (!visit) {
            return res.status(404).json({ message: 'Visit not found' });
        }

        // Only allow STAFF (the PIC), SECURITY, or ADMIN to update status
        if (req.user.role === 'STAFF' && visit.person_to_meet !== req.user.full_name) {
            return res.status(403).json({ message: 'You are not authorized to approve this visit.' });
        }
        // If user is USER, they can't update status
        if (req.user.role === 'USER') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // If newly CHECKED_IN via Security Approve, notify PIC
        if (status === 'CHECKED_IN' && visit.status !== 'CHECKED_IN') {
             try {
                const pic = await User.findOne({ where: { full_name: visit.person_to_meet, role: 'STAFF' } });
                if (pic && pic.email) {
                    emailService.sendPICCheckInAlert(pic.email, visit.full_name);
                }
            } catch (err) { console.error(err); }
        }

        visit.status = status;
        await visit.save();

        res.json({ message: `Visit successfully ${status.toLowerCase()}`, visit });
    } catch (error) {
        res.status(500).json({ message: 'Error updating visit status', error: error.message });
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
    let newStatus = visit.status;
    let message = '';
    
    if (visit.status === 'REJECTED') {
      return res.status(403).json({ message: 'Visit was rejected by the PIC.' });
    } else if (visit.status === 'PENDING' || visit.status === 'APPROVED') {
      newStatus = 'CHECKED_IN';
      message = 'Visitor successfully checked in';
      
      // Notify PIC that their guest has arrived at lobby
      try {
          const pic = await User.findOne({ where: { full_name: visit.person_to_meet, role: 'STAFF' } });
          if (pic && pic.email) {
              emailService.sendPICCheckInAlert(pic.email, visit.full_name);
          }
      } catch (err) { console.error(err); }

    } else if (visit.status === 'CHECKED_IN') {
      newStatus = 'DONE';
      message = 'Visitor successfully checked out';
    } else if (visit.status === 'DONE' || visit.status === 'CHECKED_OUT') {
      return res.status(400).json({ message: 'Visitor has already checked out', visit });
    }

    visit.status = newStatus;
    await visit.save();

    res.json({
      message,
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
