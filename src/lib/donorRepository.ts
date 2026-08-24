import fs from 'fs';
import path from 'path';
import dbConnect from './db';
import User from '@/models/User';
import { encrypt, decrypt, hashValue } from './security';

const FALLBACK_FILE = path.join(process.cwd(), 'src', 'lib', 'fallback_db.json');

// Helper to escape special characters for regex matching to prevent injection/ReDoS
function escapeRegex(string: string): string {
  if (!string) return '';
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// Helper to read fallback JSON file
function readFallbackFile(): unknown[] {
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
function writeFallbackFile(data: unknown[]): void {
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
async function checkDbConnected(): Promise<boolean> {
  try {
    await dbConnect();
    return true;
  } catch {
    console.warn('⚠️ MongoDB connection failed. Falling back to local file database.');
    return false;
  }
}

// Decrypt phone field of a donor object for consumption
function decryptDonorFields(donor: unknown): unknown {
  if (!donor) return null;
  const donorObj =
    typeof (donor as { toObject?: () => unknown }).toObject === 'function'
      ? (donor as { toObject: () => Record<string, unknown> }).toObject()
      : { ...(donor as Record<string, unknown>) };
  if (donorObj.phone) {
    donorObj.phone = decrypt(donorObj.phone as string);
  }
  return donorObj;
}

interface DonorFilter {
  bloodGroup?: string;
  status?: string;
  division?: string;
  district?: string;
  area?: string;
}

export const donorRepository = {
  async find(filter: DonorFilter) {
    const isDbConnected = await checkDbConnected();
    if (isDbConnected) {
      const mongoFilter: Record<string, unknown> = { role: 'donor' };
      if (filter.bloodGroup) mongoFilter.bloodGroup = filter.bloodGroup;
      if (filter.division)
        mongoFilter['location.division'] = {
          $regex: new RegExp(escapeRegex(filter.division.trim()), 'i'),
        };
      if (filter.district)
        mongoFilter['location.district'] = {
          $regex: new RegExp(escapeRegex(filter.district.trim()), 'i'),
        };
      if (filter.area)
        mongoFilter['location.area'] = {
          $regex: new RegExp(escapeRegex(filter.area.trim()), 'i'),
        };
      const list = await User.find(mongoFilter).sort({ createdAt: -1 });
      return list.map(decryptDonorFields);
    }

    // Fallback file filtering
    let list = readFallbackFile() as Record<string, unknown>[];

    if (filter.bloodGroup) {
      list = list.filter(
        (d) =>
          (d.bloodGroup as string)?.toUpperCase() === filter.bloodGroup!.toUpperCase()
      );
    }
    if (filter.division) {
      const regex = new RegExp(escapeRegex(filter.division.trim()), 'i');
      list = list.filter((d) => regex.test((d.division || (d.location as Record<string,unknown>)?.division) as string));
    }
    if (filter.district) {
      const regex = new RegExp(escapeRegex(filter.district.trim()), 'i');
      list = list.filter((d) => regex.test((d.district || (d.location as Record<string,unknown>)?.district) as string));
    }

    return list
      .map(decryptDonorFields)
      .sort(
        (a, b) =>
          new Date((b as Record<string,unknown>).createdAt as string).getTime() -
          new Date((a as Record<string,unknown>).createdAt as string).getTime()
      );
  },

  async findOne(idOrDonorId: string) {
    const isDbConnected = await checkDbConnected();
    if (isDbConnected) {
      let doc = null;
      if (idOrDonorId.match(/^[0-9a-fA-F]{24}$/)) {
        doc = await User.findById(idOrDonorId);
      }
      return decryptDonorFields(doc);
    }

    const list = readFallbackFile() as Record<string, unknown>[];
    const doc = list.find((d) => d._id === idOrDonorId) || null;
    return decryptDonorFields(doc);
  },

  async create(data: Record<string, unknown>) {
    const isDbConnected = await checkDbConnected();

    const dataToSave = { ...data };
    if (dataToSave.phone) {
      const hashedPhone = hashValue(dataToSave.phone as string);

      const existing = isDbConnected
        ? await User.findOne({ phoneHash: hashedPhone })
        : (readFallbackFile() as Record<string, unknown>[]).find(
            (d) => d.phoneHash === hashedPhone
          );

      if (existing) {
        const err = Object.assign(new Error('A donor with this phone number already exists.'), { code: 11000 });
        throw err;
      }

      dataToSave.phoneHash = hashedPhone;
      dataToSave.phone = encrypt(dataToSave.phone as string);
    }

    if (isDbConnected) {
      const newUser = new User(dataToSave);
      await newUser.save();
      return decryptDonorFields(newUser);
    }

    // Save to local file database
    const list = readFallbackFile() as Record<string, unknown>[];
    const donorObj = {
      ...dataToSave,
      _id: Date.now().toString(16),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(donorObj);
    writeFallbackFile(list);
    return decryptDonorFields(donorObj);
  },

  async update(idOrDonorId: string, updateData: Record<string, unknown>) {
    const isDbConnected = await checkDbConnected();

    const dataToSave = { ...updateData };
    if (dataToSave.phone) {
      dataToSave.phone = encrypt(dataToSave.phone as string);
    }

    if (isDbConnected) {
      const donor = await User.findByIdAndUpdate(idOrDonorId, dataToSave, { new: true });
      return decryptDonorFields(donor);
    }

    const list = readFallbackFile() as Record<string, unknown>[];
    const idx = list.findIndex((d) => d._id === idOrDonorId);
    if (idx === -1) return null;

    const updatedDonor = { ...list[idx], ...dataToSave, updatedAt: new Date().toISOString() };
    list[idx] = updatedDonor;
    writeFallbackFile(list);
    return decryptDonorFields(updatedDonor);
  },

  async delete(idOrDonorId: string) {
    const isDbConnected = await checkDbConnected();
    if (isDbConnected) {
      const result = await User.deleteOne({ _id: idOrDonorId });
      return result.deletedCount > 0;
    }

    const list = readFallbackFile() as Record<string, unknown>[];
    const filteredList = list.filter((d) => d._id !== idOrDonorId);
    writeFallbackFile(filteredList);
    return filteredList.length < list.length;
  },
};
