import fs from 'fs';
import path from 'path';
import dbConnect from './db';
import Donor from '../models/donor';

const FALLBACK_FILE = path.join(process.cwd(), 'src', 'lib', 'fallback_db.json');

// Helper to read fallback JSON file
function readFallbackFile() {
  try {
    if (!fs.existsSync(FALLBACK_FILE)) {
      const dir = path.dirname(FALLBACK_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(FALLBACK_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(FALLBACK_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading fallback file:', err);
    return [];
  }
}

// Helper to write fallback JSON file
function writeFallbackFile(data) {
  try {
    const dir = path.dirname(FALLBACK_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing fallback file:', err);
  }
}

// Check database availability
async function checkDbConnected() {
  try {
    await dbConnect();
    return true;
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed. Falling back to local file database (src/lib/fallback_db.json).');
    return false;
  }
}

export const donorRepository = {
  async find(filter) {
    const isDbConnected = await checkDbConnected();
    if (isDbConnected) {
      const mongoFilter = {};
      if (filter.bloodGroup) {
        mongoFilter.bloodGroup = filter.bloodGroup;
      }
      if (filter.status) {
        mongoFilter.status = filter.status;
      }
      if (filter.division) {
        mongoFilter.division = { $regex: new RegExp(filter.division.trim(), 'i') };
      }
      if (filter.district) {
        mongoFilter.district = { $regex: new RegExp(filter.district.trim(), 'i') };
      }
      if (filter.upazilaOrArea) {
        mongoFilter.upazilaOrArea = { $regex: new RegExp(filter.upazilaOrArea.trim(), 'i') };
      }
      return await Donor.find(mongoFilter).sort({ createdAt: -1 });
    }

    // Fallback file filtering
    let list = readFallbackFile();

    if (filter.bloodGroup) {
      list = list.filter((d) => d.bloodGroup.toUpperCase() === filter.bloodGroup.toUpperCase());
    }
    if (filter.status) {
      list = list.filter((d) => d.status.toLowerCase() === filter.status.toLowerCase());
    }
    if (filter.division) {
      const regex = new RegExp(filter.division.trim(), 'i');
      list = list.filter((d) => regex.test(d.division));
    }
    if (filter.district) {
      const regex = new RegExp(filter.district.trim(), 'i');
      list = list.filter((d) => regex.test(d.district));
    }
    if (filter.upazilaOrArea) {
      const regex = new RegExp(filter.upazilaOrArea.trim(), 'i');
      list = list.filter((d) => regex.test(d.upazilaOrArea));
    }

    // Sort newest first
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findOne(idOrDonorId) {
    const isDbConnected = await checkDbConnected();
    if (isDbConnected) {
      if (idOrDonorId.startsWith('D-')) {
        return await Donor.findOne({ donorId: idOrDonorId });
      }
      if (idOrDonorId.match(/^[0-9a-fA-F]{24}$/)) {
        return await Donor.findById(idOrDonorId);
      }
      return null;
    }

    const list = readFallbackFile();
    return list.find((d) => d.donorId === idOrDonorId || d._id === idOrDonorId) || null;
  },

  async create(data) {
    // Validate using Mongoose schema validation (fully synchronous & offline support)
    const tempDonor = new Donor(data);
    const validationError = tempDonor.validateSync();
    if (validationError) {
      throw validationError;
    }

    const isDbConnected = await checkDbConnected();
    if (isDbConnected) {
      await tempDonor.save();
      return tempDonor;
    }

    // Save to local file database
    const list = readFallbackFile();
    const donorObj = tempDonor.toObject();
    
    // Ensure timestamps and string ID for mock structure
    donorObj._id = donorObj._id ? donorObj._id.toString() : new Date().getTime().toString(16);
    donorObj.createdAt = new Date().toISOString();
    donorObj.updatedAt = new Date().toISOString();

    list.push(donorObj);
    writeFallbackFile(list);

    return donorObj;
  },

  async update(idOrDonorId, updateData) {
    const isDbConnected = await checkDbConnected();
    if (isDbConnected) {
      const donor = idOrDonorId.startsWith('D-')
        ? await Donor.findOne({ donorId: idOrDonorId })
        : await Donor.findById(idOrDonorId);

      if (!donor) return null;

      Object.assign(donor, updateData);
      const validationError = donor.validateSync();
      if (validationError) {
        throw validationError;
      }
      await donor.save();
      return donor;
    }

    // Update in local file database
    const list = readFallbackFile();
    const idx = list.findIndex((d) => d.donorId === idOrDonorId || d._id === idOrDonorId);
    if (idx === -1) return null;

    const donor = list[idx];
    const updatedDonor = { ...donor, ...updateData, updatedAt: new Date().toISOString() };

    // Validate using schema (offline support)
    const tempDonor = new Donor(updatedDonor);
    const validationError = tempDonor.validateSync();
    if (validationError) {
      throw validationError;
    }

    list[idx] = updatedDonor;
    writeFallbackFile(list);
    return updatedDonor;
  },

  async delete(idOrDonorId) {
    const isDbConnected = await checkDbConnected();
    if (isDbConnected) {
      const result = idOrDonorId.startsWith('D-')
        ? await Donor.deleteOne({ donorId: idOrDonorId })
        : await Donor.deleteOne({ _id: idOrDonorId });
      return result.deletedCount > 0;
    }

    const list = readFallbackFile();
    const originalLen = list.length;
    const filteredList = list.filter((d) => d.donorId !== idOrDonorId && d._id !== idOrDonorId);
    writeFallbackFile(filteredList);
    return filteredList.length < originalLen;
  },
};
