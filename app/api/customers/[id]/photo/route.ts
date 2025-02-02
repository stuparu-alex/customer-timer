import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { connectDB } from '@/app/lib/mongodb';
import { Customer } from '@/app/models/Customer';
import fs from 'fs/promises';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const data = await request.formData();
    const file: File | null = data.get('photo') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Ensure uploads directory exists
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'customers');
      await fs.mkdir(uploadDir, { recursive: true });

      // Generate unique filename
      const fileName = `${uuidv4()}.jpg`;
      const filePath = join(uploadDir, fileName);

      // Process and save the image
      await sharp(buffer)
        .resize(200, 200, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(filePath);

      // Update customer record with photo path
      const photoUrl = `/uploads/customers/${fileName}`;
      await Customer.findByIdAndUpdate(params.id, { photo: photoUrl });

      return NextResponse.json({ photoUrl });
    } catch (error) {
      console.error('Image processing error:', error);
      return NextResponse.json(
        { error: 'Failed to process image' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const customer = await Customer.findById(params.id);
    if (!customer || !customer.photo) {
      return NextResponse.json(
        { error: 'No photo found' },
        { status: 404 }
      );
    }

    // Delete file from filesystem
    const filePath = join(process.cwd(), 'public', customer.photo);
    await unlink(filePath);

    // Update customer record
    await Customer.findByIdAndUpdate(params.id, { photo: null });

    return NextResponse.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Photo deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
} 