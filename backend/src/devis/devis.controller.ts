import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateDevisDto } from './dto/create-devis.dto';
import { CreateDevisItemDto } from './dto/create-devis-item.dto';
import { UpdateDevisDto } from './dto/update-devis.dto';
import { UpdateDevisItemDto } from './dto/update-devis-item.dto';
import { Devis } from './schemas/devis.schema';
import { DevisItem } from './schemas/devis-item.schema';
import { DevisService } from './devis.service';

@Controller('devis')
export class DevisController {
  constructor(private readonly devisService: DevisService) {}

  /**
   * Corps enrichi (titre, articles, …). `@Body()` typé `CreateDevisDto` déclenche le
   * ValidationPipe global (`forbidNonWhitelisted`). Avec `body: any`, le pipe global
   * ignore la validation (métatype Object) : le JSON arrive tel quel au service.
   */
  @Post()
  create(@Body() body: any) {
    return this.devisService.create(body as CreateDevisDto);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    if (projectId) {
      return this.devisService.findByProject(projectId);
    }
    return this.devisService.findAll();
  }

  /**
   * Client : accepte / refuse (chemins statiques en premier — même logique que :id/…).
   * Préféré par le frontend ; les variantes `:id/accepter` restent pour compatibilité.
   */
  @Post('accepter/:id')
  accepterDevis(@Param('id') id: string) {
    return this.devisService.accepter(id);
  }

  @Post('refuser/:id')
  refuserDevis(@Param('id') id: string) {
    return this.devisService.refuser(id);
  }

  /** @deprecated Utiliser POST /devis/accepter/:id — conservé pour anciens clients */
  @Post(':id/accepter')
  accepter(@Param('id') id: string) {
    return this.devisService.accepter(id);
  }

  /** @deprecated Utiliser POST /devis/refuser/:id */
  @Post(':id/refuser')
  refuser(@Param('id') id: string) {
    return this.devisService.refuser(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devisService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDevisDto: UpdateDevisDto) {
    return this.devisService.update(
      id,
      updateDevisDto as unknown as Partial<Devis>,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devisService.remove(id);
  }

  // DevisItem endpoints
  @Post(':id/items')
  createItem(
    @Param('id') devisId: string,
    @Body() createItemDto: CreateDevisItemDto,
  ) {
    return this.devisService.createItem({
      ...(createItemDto as unknown as Partial<DevisItem>),
      devisId: new Types.ObjectId(devisId),
    });
  }

  @Get(':id/items')
  findItems(@Param('id') devisId: string) {
    return this.devisService.findItemsByDevis(devisId);
  }

  @Put('items/:itemId')
  updateItem(
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdateDevisItemDto,
  ) {
    return this.devisService.updateItem(
      itemId,
      updateItemDto as unknown as Partial<DevisItem>,
    );
  }

  @Delete('items/:itemId')
  removeItem(@Param('itemId') itemId: string) {
    return this.devisService.removeItem(itemId);
  }
}
