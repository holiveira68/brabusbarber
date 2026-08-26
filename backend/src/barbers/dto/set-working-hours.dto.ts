import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsString, Max, Min, ValidateNested } from 'class-validator';

class WorkingHourItemDto {
  @IsInt()
  @Min(0)
  @Max(6)
  weekday: number; // 0 = domingo ... 6 = sábado

  @IsString()
  startTime: string; // "09:00"

  @IsString()
  endTime: string; // "18:00"
}

export class SetWorkingHoursDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WorkingHourItemDto)
  hours: WorkingHourItemDto[];
}
