import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Express, Response } from 'express';

@Controller('/api/uploads')
export class UploadsController {
  constructor() {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './images',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${Math.round(Math.random() * 1000000)}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(new Error('Unsupported file type'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    }),
  )
  public uploadFile(@UploadedFile() file: Express.Multer.File) {
    // Implementation for file upload
    if (!file) {
      throw new BadRequestException('File upload failed');
    }

    console.log('File uploaded', file);
    return { message: 'File uploaded successfully', filename: file.filename };
  }

  @Get('/:image')
  public showUploadedFile(@Param('image') image: string, @Res() res: Response) {
    // Implementation to show uploaded file
    return res.sendFile(image, { root: './images' });
  }
}
