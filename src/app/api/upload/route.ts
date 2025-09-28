import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory might already exist
    }

    // Save file to uploads directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadsDir, file.name);
    await writeFile(filePath, buffer);

    // Read and parse Excel/CSV file
    let jsonData;
    if (file.name.endsWith('.csv')) {
      // Handle CSV files
      const csvText = buffer.toString('utf-8');
      const lines = csvText.split('\n').filter(line => line.trim());
      jsonData = lines.map(line => line.split(',').map(cell => cell.trim()));
    } else {
      // Handle Excel files
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    }

    console.log('File parsed:', {
      fileName: file.name,
      fileType: file.name.endsWith('.csv') ? 'CSV' : 'Excel',
      totalRows: jsonData.length,
      firstRow: jsonData[0],
      sampleRows: jsonData.slice(0, 3)
    });

    // Convert to proper format
    const headers = jsonData[0] as string[];
    const rows = jsonData.slice(1) as [][];

    console.log('Headers found:', headers);
    console.log('Sample rows:', rows.slice(0, 3));

    const processedData = rows.map((row) => {
      const obj: { [key: string]: number | string } = {};
      headers.forEach((header, colIndex) => {
        const value = row[colIndex];
        // Convert to number if it's a numeric string
        if (typeof value === 'string' && !isNaN(Number(value))) {
          obj[header] = Number(value);
        } else {
          obj[header] = value || 0;
        }
      });
      return obj;
    }).filter(row => {
      // More flexible filtering - check for various depth column names and formats
      const depthValue = row.Depth || row.depth || row.DEPTH || row['Depth (ft)'] || row['DEPTH (FT)'];
      const numericDepth = Number(depthValue);
      return depthValue && !isNaN(numericDepth) && numericDepth > 0;
    });

    console.log('Processed data:', {
      totalRows: rows.length,
      filteredRows: processedData.length,
      sampleProcessed: processedData.slice(0, 2)
    });

    // If no data passed the depth filter, return all data for debugging
    let finalData = processedData;
    if (processedData.length === 0 && rows.length > 0) {
      console.log('No data passed depth filter, returning all data for debugging');
      finalData = rows.map((row) => {
        const obj: { [key: string]: number | string } = {};
        headers.forEach((header, colIndex) => {
          const value = row[colIndex];
          if (typeof value === 'string' && !isNaN(Number(value))) {
            obj[header] = Number(value);
          } else {
            obj[header] = value || 0;
          }
        });
        return obj;
      });
    }

    return NextResponse.json({
      success: true,
      data: finalData,
      message: `File uploaded and processed successfully. Found ${finalData.length} data points.`,
      debug: {
        totalRows: rows.length,
        filteredRows: processedData.length,
        finalRows: finalData.length,
        headers: headers
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}
