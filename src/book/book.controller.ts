import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { BookService } from './book.service';
import CreateBookDto from './dto/create-book.dto';
import UpdateBookDto from './dto/update-book.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/my-file-storage';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads',
      storage: storage,
      limits: {
        fileSize: 1024 * 1024 * 3, // 3MB
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
          cb(null, true);
        } else {
          cb(
            new BadRequestException('Only JPEG and PNG files are allowed!'),
            false,
          );
        }
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    // 文件路径 file.path
    // uploads\1732677492022-292786726-微信图片_20241114180513.jpg
    return file.path;
  }

  @Get('list')
  async getList() {
    return this.bookService.getList();
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    return this.bookService.findById(id);
  }

  @Post('create')
  async create(@Body() bookDto: CreateBookDto) {
    return this.bookService.create(bookDto);
  }

  @Post('update')
  async update(@Body() bookDto: UpdateBookDto) {
    return this.bookService.update(bookDto);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: number) {
    return this.bookService.delete(id);
  }
}
