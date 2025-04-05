const express = require('express');
const BackupController = require('../controllers/backupController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Create a new backup (accessible to all authenticated users)
router.post('/', 
    authMiddleware,
    BackupController.createBackup
);

// Get all backups (accessible to all authenticated users)
router.get('/', 
    authMiddleware,
    BackupController.getBackups
);

// Restore from a backup (accessible to all authenticated users)
router.post('/:id/restore', 
    authMiddleware,
    BackupController.restoreBackup
);

// Delete a backup (admin only)
router.delete('/:id', 
    authMiddleware, 
    roleMiddleware(['Admin']), // Only users with 'Admin' role can access
    BackupController.deleteBackup
);

module.exports = router;
