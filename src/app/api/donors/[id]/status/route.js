import { donorController } from '@/controllers/donorController';

// PATCH: Update availability status ONLY
export async function PATCH(request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  return donorController.updateDonorStatus(id, request);
}

// PUT: Update availability status ONLY (as alternative)
export async function PUT(request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  return donorController.updateDonorStatus(id, request);
}
