import { donorController } from '@/controllers/donorController';

// GET: Retrieve a single donor's information
export async function GET(request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  return donorController.getDonorProfile(id);
}

// PUT: Update a donor's information or status
export async function PUT(request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  return donorController.updateDonorProfile(id, request);
}

// DELETE: Delete a donor profile
export async function DELETE(request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  return donorController.deleteDonorProfile(id);
}

