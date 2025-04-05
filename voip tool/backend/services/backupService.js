import Backup from '../models/backupModel.js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.resolve();
const BACKUP_DIR = path.join(__dirname, '../../backups');

class BackupService {
    static async createBackup({ description, includeLogs, includeConfig, userId }) {
        try {
            // Create backup directory if it doesn't exist
            if (!fs.existsSync(BACKUP_DIR)) {
                fs.mkdirSync(BACKUP_DIR, { recursive: true });
            }

            const backupId = uuidv4();
            const timestamp = new Date().toISOString();
            const backupPath = path.join(BACKUP_DIR, `${backupId}.tar.gz`);

            // Create backup archive
            const filesToBackup = [];
            if (includeLogs) filesToBackup.push('logs/*.log');
            if (includeConfig) filesToBackup.push('config/*.json');

            if (filesToBackup.length > 0) {
                execSync(`tar -czf ${backupPath} ${filesToBackup.join(' ')}`, {
                    cwd: path.join(__dirname, '../../')
                });
            }

            // Save backup record to database
            const backup = new Backup({
                id: backupId,
                userId,
                description,
                path: backupPath,
                size: fs.statSync(backupPath).size,
                includeLogs,
                includeConfig,
                createdAt: timestamp
            });

            await backup.save();
            return backup;
        } catch (error) {
            throw new Error(`Backup creation failed: ${error.message}`);
        }
    }

    static async getBackups(userId) {
        try {
            return await Backup.find({ userId }).sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Failed to fetch backups: ${error.message}`);
        }
    }

    static async restoreBackup(backupId, userId) {
        try {
            const backup = await Backup.findOne({ id: backupId, userId });
            if (!backup) {
                throw new Error('Backup not found');
            }

            // Extract backup archive
            execSync(`tar -xzf ${backup.path} -C ${path.join(__dirname, '../../')}`);

            return { message: 'Backup restored successfully' };
        } catch (error) {
            throw new Error(`Restore failed: ${error.message}`);
        }
    }

    static async deleteBackup(backupId, userId) {
        try {
            const backup = await Backup.findOneAndDelete({ id: backupId, userId });
            if (!backup) {
                throw new Error('Backup not found');
            }

            // Delete backup file
            fs.unlinkSync(backup.path);

            return { message: 'Backup deleted successfully' };
        } catch (error) {
            throw new Error(`Delete failed: ${error.message}`);
        }
    }
}

export default BackupService;
