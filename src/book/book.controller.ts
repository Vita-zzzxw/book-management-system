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
  Query,
  UploadedFiles,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BookService } from './book.service';
import CreateBookDto from './dto/create-book.dto';
import UpdateBookDto from './dto/update-book.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/my-file-storage';
import * as fs from 'fs';

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

  // 大文件上传分片
  @Post('maxUpload')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      dest: 'uploads',
    }),
  )
  uploadFile2(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body,
  ) {
    const fileName = body.name.match(/(.+)\-\d+$/)[1];
    const chunkDir = 'uploads/chunks_' + fileName;

    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir);
    }
    fs.cpSync(files[0].path, chunkDir + '/' + body.name);
    fs.rmSync(files[0].path);
  }

  @Get('merge')
  async merge(@Query('name') name: string) {
    const chunkDir = 'uploads/chunks_' + name;

    if (!fs.existsSync(chunkDir)) {
      throw new HttpException(
        `Directory ${chunkDir} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }

    const files = fs.readdirSync(chunkDir).sort((a, b) => {
      const aNum = parseInt(a.split('-')[1]);
      const bNum = parseInt(b.split('-')[1]);
      return aNum - bNum;
    });

    let count = 0;
    let startPos = 0;
    const filePath = 'uploads/' + name;
    files.forEach((file) => {
      const filePath = chunkDir + '/' + file;
      const stream = fs.createReadStream(filePath);
      stream
        .pipe(
          fs.createWriteStream('uploads/' + name, {
            start: startPos,
          }),
        )
        .on('finish', () => {
          count++;
          if (count === files.length) {
            fs.rm(
              chunkDir,
              {
                recursive: true,
              },
              () => {},
            );
          }
        });

      startPos += fs.statSync(filePath).size;
    });

    return filePath;
  }

  @Get('list')
  async list(@Query('name') name: string) {
    return this.bookService.list(name);
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
