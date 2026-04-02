import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with env variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

import { Readable } from 'stream';

export async function POST(req: NextRequest) {
    try {
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error('Missing Cloudinary credentials');
            return NextResponse.json(
                { error: 'Server configuration error: Missing Cloudinary credentials. Please restart the server.' },
                { status: 500 }
            );
        }


        const { searchParams } = new URL(req.url);
        const folder = searchParams.get('folder') || 'rnd-blog';
        const urlParam = searchParams.get('url');

        // Case 1: Remote URL Upload (Drive, etc)
        if (urlParam) {
            let targetUrl = urlParam;
            // Auto-convert Google Drive links to direct download links
            if (urlParam.includes('drive.google.com')) {
                const docIdMatch = urlParam.match(/\/d\/([a-zA-Z0-9_-]+)/);
                if (docIdMatch?.[1]) {
                    targetUrl = `https://drive.google.com/uc?export=download&id=${docIdMatch[1]}`;
                }
            }

            const result = await cloudinary.uploader.upload(targetUrl, {
                resource_type: 'auto',
                folder: folder,
            });
            return NextResponse.json(result);
        }

        // Case 2: Direct File Buffer Upload
        const arrayBuffer = await req.arrayBuffer();
        if (arrayBuffer.byteLength === 0) {
           return NextResponse.json({ error: 'No data provided' }, { status: 400 });
        }
        const buffer = Buffer.from(arrayBuffer);

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    folder: folder,
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary Stream Error:', error);
                        reject(error);
                    }
                    else resolve(result);
                }
            );

            uploadStream.end(buffer);
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Upload Error Details:', error);
        return NextResponse.json(
            { 
              error: error.message || 'Upload failed',
              details: error.http_code ? `Error ${error.http_code}: ${error.message}` : error.message
            },
            { status: error.http_code || 500 }
        );
    }
}
