import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/** Body de actualización parcial (PATCH). */
export class UpdateRequestDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  resourceId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
