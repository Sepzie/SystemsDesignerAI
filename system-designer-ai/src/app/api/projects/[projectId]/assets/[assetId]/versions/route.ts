import { NextRequest, NextResponse } from 'next/server';
import { AssetService } from '@/lib/asset/asset-service';

const assetService = new AssetService();

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; assetId: string } }
) {
  try {
    const asset = await assetService.getAssetById(params.assetId);
    
    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Verify the asset belongs to the project
    if (asset.project_id !== params.projectId) {
      return NextResponse.json(
        { error: 'Asset not found in project' },
        { status: 404 }
      );
    }

    const versions = await assetService.getAssetVersions(params.assetId);
    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching asset versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset versions' },
      { status: 500 }
    );
  }
} 