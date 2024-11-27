import { IsNotEmpty } from 'class-validator';

export default class CreateBookDto {
  @IsNotEmpty({ message: '书名不能为空' })
  name: string;
  @IsNotEmpty({ message: '作者不能为空' })
  author: string;
  description: string;
  cover: string;
}