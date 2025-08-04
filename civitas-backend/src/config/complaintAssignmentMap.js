const complaintAssignmentMap = {
  'Sanitation & Waste': {
    'Garbage Overflow': 'sanitationDepartmentId_or_NGOId_1',
    'Missed Waste Pickup': 'sanitationDepartmentId_or_NGOId_1',
    '_default': 'sanitationDepartmentId_or_NGOId_1', 
  },
  'Drainage & Water': {
    'Drainage Overflow': 'drainageDepartmentId_or_NGOId_2',
    'Waterlogging / Flooded Street': 'drainageDepartmentId_or_NGOId_2',
    '_default': 'drainageDepartmentId_or_NGOId_2',
  },
  'Electrical & Lighting': {
    'Streetlight Not Working': 'electricalDepartmentId_or_NGOId_3',
    'Streetlight Always ON': 'electricalDepartmentId_or_NGOId_3',
    '_default': 'electricalDepartmentId_or_NGOId_3',
  },
  'Road & Infrastructure': {
    'Pothole / Damaged Road': 'bbmpDepartmentId_or_NGOId_4',
    'Tree Fallen / Road Obstruction': 'bbmpDepartmentId_or_NGOId_4',
    '_default': 'bbmpDepartmentId_or_NGOId_4',
  },
  'Animal Safety / Nuisance': {
    'Stray Dog Issue': 'animalControlId_or_NGOId_5',
    'Cattle Blocking Road': 'animalControlId_or_NGOId_5',
    '_default': 'animalControlId_or_NGOId_5',
  },
  'Public Safety': {
    'Noise Complaint': 'policeDepartmentId_or_NGOId_6',
    'Broken Footpath / Open Manhole': 'bbmpDepartmentId_or_NGOId_4',
    '_default': 'generalPublicSafetyId_or_NGOId_7',
  },
  '_default': 'cityAdminDefaultId', 
};

module.exports = complaintAssignmentMap;