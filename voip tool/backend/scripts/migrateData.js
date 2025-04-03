import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const localUri = 'mongodb://localhost:27017/voip-monitoring';
const atlasUri = process.env.MONGODB_URI;

const migrateData = async () => {
    try {
        // Connect to local MongoDB
        console.log('Connecting to local MongoDB...');
        const localConn = await mongoose.createConnection(localUri);
        console.log('Connected to local MongoDB');

        // Connect to Atlas MongoDB
        console.log('Connecting to MongoDB Atlas...');
        const atlasConn = await mongoose.createConnection(atlasUri);
        console.log('Connected to MongoDB Atlas');

        // Get all collection names from local database
        const collections = await localConn.db.listCollections().toArray();
        console.log('\nFound collections:', collections.map(c => c.name));

        // Migrate each collection
        for (const collection of collections) {
            const collectionName = collection.name;
            console.log(`\nMigrating collection: ${collectionName}`);

            // Get all documents from local collection
            const documents = await localConn.db.collection(collectionName).find({}).toArray();
            console.log(`Found ${documents.length} documents`);

            if (documents.length > 0) {
                // Insert documents into Atlas
                await atlasConn.db.collection(collectionName).insertMany(documents);
                console.log(`Successfully migrated ${documents.length} documents to Atlas`);
            }
        }

        console.log('\nMigration completed successfully!');
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        // Close connections
        await mongoose.disconnect();
        console.log('Connections closed');
    }
};

migrateData(); 