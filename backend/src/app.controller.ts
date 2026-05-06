import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { FacturesService } from './factures/factures.service';

@Controller()
export class AppController {
  constructor(private readonly facturesService: FacturesService) {}

  @Get()
  getHello() {
    return {
      message: 'BMP.tn API is running!',
      version: '1.0.0',
      baseUrl: '/api',
      endpoints: {
        users: {
          getAll: 'GET /api/users',
          getOne: 'GET /api/users/:id',
          create: 'POST /api/users',
          update: 'PUT /api/users/:id',
          delete: 'DELETE /api/users/:id',
        },
        projects: {
          getAll: 'GET /api/projects',
          getOne: 'GET /api/projects/:id',
          create: 'POST /api/projects',
          update: 'PUT /api/projects/:id',
          delete: 'DELETE /api/projects/:id',
        },
        suiviProjects: {
          getAll: 'GET /api/suivi-projects',
          getByProject: 'GET /api/suivi-projects?projectId=:id',
          create: 'POST /api/suivi-projects',
        },
        devis: {
          getAll: 'GET /api/devis',
          getOne: 'GET /api/devis/:id',
          create: 'POST /api/devis',
          addItem: 'POST /api/devis/:id/items',
        },
        factures: {
          getAll: 'GET /api/factures',
          getOne: 'GET /api/factures/:id',
          paiements: 'GET|POST /api/factures/:id/paiements',
        },
        marketplace: {
          produits: {
            getAll: 'GET /api/marketplace/produits',
            getOne: 'GET /api/marketplace/produits/:id',
            create: 'POST /api/marketplace/produits',
          },
          commandes: {
            getAll: 'GET /api/marketplace/commandes',
            getOne: 'GET /api/marketplace/commandes/:id',
            create: 'POST /api/marketplace/commandes',
          },
        },
      },
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /** Chemins les plus spécifiques en premier (Nest / Express). */
  @Get('factures/:id/paiements')
  getFacturePaiements(@Param('id') id: string) {
    return this.facturesService.getPaiements(id);
  }

  @Post('factures/:id/paiements')
  addFacturePaiement(@Param('id') id: string, @Body() body: any) {
    return this.facturesService.recordPaiement(id, body ?? {});
  }

  @Get('factures/:id')
  getFactureOne(@Param('id') id: string) {
    return this.facturesService.findOne(id);
  }

  @Get('factures')
  listFactures(
    @Query('projectId') projectId?: string,
    @Headers('x-user-id') userId?: string,
    @Headers('x-user-role') role?: string,
    @Headers('x-user-email') userEmail?: string,
  ) {
    return this.facturesService.findForUser(userId, role, userEmail, projectId);
  }
}
