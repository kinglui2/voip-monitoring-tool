const BackupService = require('../services/backupService');

class BackupController {
    static async createBackup(req, res) {
        try {
            const { description, includeLogs, includeConfig } = req.body;
            const backup = await BackupService.createBackup({
                description,
                includeLogs,
                includeConfig,
                userId: req.user.id
            });
            res.status(201).json(backup);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getBackups(req, res) {
        try {
            const backups = await BackupService.getBackups(req.user.id);
            res.status(200).json(backups);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async restoreBackup(req, res) {
        try {
            const { id } = req.params;
            await BackupService.restoreBackup(id, req.user.id);
            res.status(200).json({ message: 'Backup restored successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteBackup(req, res) {
        try {
            const { id } = req.params;
            await BackupService.deleteBackup(id, req.user.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = BackupController;
