import { NextResponse } from 'next/server';
import { donorRepository } from '../lib/donorRepository';

// Regex for Bangladeshi phone validation
const phoneRegex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;

export const donorController = {
  // GET: List/Search donors
  async getDonors(request) {
    try {
      const { searchParams } = new URL(request.url);
      const filter = {};

      const bloodGroup = searchParams.get('bloodGroup');
      if (bloodGroup) filter.bloodGroup = bloodGroup;

      const division = searchParams.get('division');
      if (division) filter.division = division;

      const district = searchParams.get('district');
      if (district) filter.district = district;

      const upazilaOrArea = searchParams.get('upazilaOrArea');
      if (upazilaOrArea) filter.upazilaOrArea = upazilaOrArea;

      const status = searchParams.get('status');
      if (status) filter.status = status;

      const donors = await donorRepository.find(filter);
      return NextResponse.json({ success: true, count: donors.length, data: donors }, { status: 200 });
    } catch (error) {
      console.error('Error fetching donors:', error);
      return NextResponse.json({ success: false, error: 'Server Error: ' + error.message }, { status: 500 });
    }
  },

  // POST: Register a new donor
  async registerDonor(request) {
    try {
      const body = await request.json();

      const sanitizedData = {
        name: body.name ? body.name.trim() : '',
        phone: body.phone ? body.phone.trim() : '',
        bloodGroup: body.bloodGroup ? body.bloodGroup.trim() : '',
        division: body.division ? body.division.trim() : '',
        district: body.district ? body.district.trim() : '',
        upazilaOrArea: body.upazilaOrArea ? body.upazilaOrArea.trim() : '',
        status: body.status ? body.status.trim() : 'Available',
      };

      // Controller level validations
      if (!sanitizedData.name || sanitizedData.name.length < 2) {
        return NextResponse.json({ success: false, errors: ['Name must be at least 2 characters long.'] }, { status: 400 });
      }
      if (!phoneRegex.test(sanitizedData.phone)) {
        return NextResponse.json({ success: false, errors: ['Invalid Bangladeshi phone number.'] }, { status: 400 });
      }
      const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      if (!validBloodGroups.includes(sanitizedData.bloodGroup)) {
        return NextResponse.json({ success: false, errors: ['Invalid blood group selected.'] }, { status: 400 });
      }
      const validStatuses = ['Available', 'Unavailable'];
      if (!validStatuses.includes(sanitizedData.status)) {
        return NextResponse.json({ success: false, errors: ['Invalid status selected.'] }, { status: 400 });
      }
      if (!sanitizedData.division || !sanitizedData.district || !sanitizedData.upazilaOrArea) {
        return NextResponse.json({ success: false, errors: ['All location fields are required.'] }, { status: 400 });
      }

      try {
        const newDonor = await donorRepository.create(sanitizedData);
        return NextResponse.json({ success: true, data: newDonor }, { status: 201 });
      } catch (validationError) {
        if (validationError.errors) {
          const messages = Object.values(validationError.errors).map((err) => err.message);
          return NextResponse.json({ success: false, errors: messages }, { status: 400 });
        }
        throw validationError;
      }
    } catch (error) {
      console.error('Error registering donor:', error);
      if (error.code === 11000) {
        return NextResponse.json({ success: false, errors: ['A donor with this phone number already exists.'] }, { status: 400 });
      }
      return NextResponse.json({ success: false, errors: ['Server Error: ' + error.message] }, { status: 500 });
    }
  },

  // GET: Retrieve a single donor's information
  async getDonorProfile(id) {
    try {
      const donor = await donorRepository.findOne(id);
      if (!donor) {
        return NextResponse.json({ success: false, error: 'Donor not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: donor }, { status: 200 });
    } catch (error) {
      console.error('Error fetching donor profile:', error);
      return NextResponse.json({ success: false, error: 'Server Error: ' + error.message }, { status: 500 });
    }
  },

  // PUT: Update a donor profile
  async updateDonorProfile(id, request) {
    try {
      const body = await request.json();

      const updateData = {};
      if (body.name !== undefined) updateData.name = body.name.trim();
      if (body.phone !== undefined) updateData.phone = body.phone.trim();
      if (body.bloodGroup !== undefined) updateData.bloodGroup = body.bloodGroup.trim();
      if (body.division !== undefined) updateData.division = body.division.trim();
      if (body.district !== undefined) updateData.district = body.district.trim();
      if (body.upazilaOrArea !== undefined) updateData.upazilaOrArea = body.upazilaOrArea.trim();
      if (body.status !== undefined) updateData.status = body.status.trim();

      // Controller validations
      if (updateData.name !== undefined && updateData.name.length < 2) {
        return NextResponse.json({ success: false, errors: ['Name must be at least 2 characters long.'] }, { status: 400 });
      }
      if (updateData.phone !== undefined && !phoneRegex.test(updateData.phone)) {
        return NextResponse.json({ success: false, errors: ['Invalid Bangladeshi phone number.'] }, { status: 400 });
      }
      if (updateData.bloodGroup !== undefined) {
        const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        if (!validBloodGroups.includes(updateData.bloodGroup)) {
          return NextResponse.json({ success: false, errors: ['Invalid blood group selected.'] }, { status: 400 });
        }
      }
      if (updateData.status !== undefined) {
        const validStatuses = ['Available', 'Unavailable'];
        if (!validStatuses.includes(updateData.status)) {
          return NextResponse.json({ success: false, errors: ['Invalid status selected.'] }, { status: 400 });
        }
      }

      try {
        const updatedDonor = await donorRepository.update(id, updateData);
        if (!updatedDonor) {
          return NextResponse.json({ success: false, error: 'Donor not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: updatedDonor }, { status: 200 });
      } catch (validationError) {
        if (validationError.errors) {
          const messages = Object.values(validationError.errors).map((err) => err.message);
          return NextResponse.json({ success: false, errors: messages }, { status: 400 });
        }
        throw validationError;
      }
    } catch (error) {
      console.error('Error updating donor profile:', error);
      return NextResponse.json({ success: false, errors: ['Server Error: ' + error.message] }, { status: 500 });
    }
  },

  // PATCH / PUT: Update availability status ONLY (Feature 2 specific endpoint action)
  async updateDonorStatus(id, request) {
    try {
      const body = await request.json();
      const status = body.status ? body.status.trim() : '';

      if (!status) {
        return NextResponse.json({ success: false, error: 'Availability status is required.' }, { status: 400 });
      }

      const validStatuses = ['Available', 'Unavailable'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ success: false, error: 'Invalid status. Must be Available or Unavailable.' }, { status: 400 });
      }

      try {
        const updatedDonor = await donorRepository.update(id, { status });
        if (!updatedDonor) {
          return NextResponse.json({ success: false, error: 'Donor not found.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: updatedDonor }, { status: 200 });
      } catch (validationError) {
        if (validationError.errors) {
          const messages = Object.values(validationError.errors).map((err) => err.message);
          return NextResponse.json({ success: false, errors: messages }, { status: 400 });
        }
        throw validationError;
      }
    } catch (error) {
      console.error('Error updating donor availability status:', error);
      return NextResponse.json({ success: false, error: 'Server Error: ' + error.message }, { status: 500 });
    }
  },

  // DELETE: Delete a donor profile
  async deleteDonorProfile(id) {
    try {
      const deleted = await donorRepository.delete(id);
      if (!deleted) {
        return NextResponse.json({ success: false, error: 'Donor not found or already deleted' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Donor profile deleted successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error deleting donor:', error);
      return NextResponse.json({ success: false, error: 'Server Error: ' + error.message }, { status: 500 });
    }
  }
};
