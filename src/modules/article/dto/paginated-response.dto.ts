import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<TData> {
  @ApiProperty({ description: 'Total number of resources' })
  total: number;

  @ApiProperty({ description: 'List of resources', isArray: true })
  data: TData[];
}
