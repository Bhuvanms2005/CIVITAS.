const Complaint = require('../../models/Complaint');

exports.createComplaintFromSensor = async (req, res) => {
  try {
    const { binId, fillLevel, latitude, longitude, address } = req.body;
    if (!binId || !fillLevel || !latitude || !longitude || !address) {
      return res.status(400).json({ success: false, message: 'Missing required sensor data.' });
    }
    const systemUserId = process.env.SYSTEM_USER_ID;
    if (!systemUserId) {
        console.error("CRITICAL: SYSTEM_USER_ID is not set in .env file.");
        return res.status(500).json({ success: false, message: 'Server configuration error.' });
    }
    const complaint = new Complaint({
      category: 'Garbage',
      subType: 'Bin Full',
      description: `Automated report from bin ${binId}: Fill level is at ${fillLevel}%.`,
      address: address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      photo: null, 
      severity: 'High',
      submittedBy: systemUserId,
    });
    await complaint.save();

    console.log(`✅ Automated complaint created for bin: ${binId}`);

    res.status(201).json({
      success: true,
      message: 'Automated complaint submitted successfully!',
      complaint,
    });

  } catch (error) {
    console.error('Error creating complaint from sensor:', error);
    res.status(500).json({ success: false, message: 'Server error during automated submission.' });
  }
};