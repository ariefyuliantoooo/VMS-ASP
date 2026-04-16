const { User, AuthLog } = require('../models');
const jwt = require('jsonwebtoken');
const mailer = require('../utils/mailer');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, full_name, company, phone, inviteToken } = req.body;

    let assignedRole = 'USER';
    
    // Check if invite token passed
    if (inviteToken) {
      try {
        const decoded = jwt.verify(inviteToken, process.env.JWT_SECRET);
        if (decoded.role === 'STAFF' && decoded.type === 'INVITATION') {
           assignedRole = 'STAFF';
        }
      } catch (err) {
        await AuthLog.create({ action: 'REGISTER_FAILED', email, ip_address: req.ip, status: 'failed', details: 'Invalid invite token' });
        return res.status(400).json({ message: 'Invalid or expired invitation token' });
      }
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      await AuthLog.create({ action: 'REGISTER_FAILED', email, ip_address: req.ip, status: 'failed', details: 'Email already exists' });
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      full_name,
      company,
      phone,
      role: assignedRole,
      is_verified: false
    });

    // Generate Verification Token
    const verifyToken = jwt.sign(
      { id: newUser.id, type: 'VERIFICATION' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Send email without blocking the response
    mailer.sendVerificationEmail(email, verifyToken).catch(console.error);

    await AuthLog.create({ action: 'REGISTER_SUCCESS', email, ip_address: req.ip, status: 'success', details: `Registered as ${assignedRole}` });

    res.status(201).json({ 
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    await AuthLog.create({ action: 'REGISTER_FAILED', email: req.body?.email || 'unknown', ip_address: req.ip, status: 'failed', details: error.message });
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isValidPassword = await user.validPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Verifikasi email dulu' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, full_name: user.full_name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Get list of all staff members
exports.getStaffList = async (req, res) => {
  try {
    const staff = await User.findAll({
      where: { role: 'STAFF' },
      attributes: ['id', 'full_name'],
      order: [['full_name', 'ASC']]
    });
    res.json(staff);
  } catch (error) {
    console.error('Get Staff List error:', error);
    res.status(500).json({ message: 'Error fetching staff list', error: error.message });
  }
};

// Generate an invite token for STAFF
exports.generateInvite = async (req, res) => {
  try {
    // Only Admin can invite
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden. Only ADMIN can generate invite links' });
    }

    const inviteToken = jwt.sign(
      { role: 'STAFF', type: 'INVITATION' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Invite token generated successfully',
      inviteToken
    });
  } catch (error) {
    console.error('Invite generation error:', error);
    res.status(500).json({ message: 'Error generating invite', error: error.message });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token tidak ditemukan' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'VERIFICATION') {
        return res.status(400).json({ message: 'Token tidak valid' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    if (user.is_verified) {
        return res.status(400).json({ message: 'Email sudah terverifikasi' });
    }

    user.is_verified = true;
    await user.save();

    res.json({ message: 'Email berhasil diverifikasi' });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(400).json({ message: 'Token invalid atau expired' });
  }
};

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
    const users = await User.findAll({ order: [['created_at', 'DESC']], attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Admin: Delete user
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Admin: Get Auth Logs
exports.getAuthLogs = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
    const logs = await AuthLog.findAll({ order: [['created_at', 'DESC']], limit: 100 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs' });
  }
};
// Admin: Create a new user manually
exports.createUser = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
    
    const { username, email, password, full_name, role, company, phone } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      full_name,
      role,
      company,
      phone,
      is_verified: true // Admins create verified users directly
    });

    await AuthLog.create({ 
        action: 'ADMIN_CREATE_USER', 
        email: req.user.email, 
        ip_address: req.ip, 
        status: 'success', 
        details: `Created user ${email} with role ${role}` 
    });

    res.status(201).json({ 
      message: 'User created successfully',
      user: { id: newUser.id, username, email, full_name, role }
    });
  } catch (error) {
    console.error('Admin Create User error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};
