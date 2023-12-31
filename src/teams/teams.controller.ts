import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamsService } from './teams.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { AddUserTeamDto } from './dto/adduser-team.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Equipo } from './entities/team.entity';
import { EditTeamDto } from './dto/edit-team.dto';
import { RemoveUserTeamDto } from './dto/removeUser.dto';

@Controller('teams')
export class TeamsController {
    constructor(
    @InjectRepository(Equipo)
    private equipoRepository: Repository<Equipo>,
    private readonly teamsService: TeamsService,) {}
  
    @Get('equipos')
    @UseGuards(AuthGuard)
    async getAllTeams(@Request() req): Promise<Equipo[]> {
      // Obtén el email del usuario desde el token
      const userEmail = req.user.email;

      // Llama al servicio de equipos para obtener los equipos asociados con el email del usuario
      try{
        const equipos = await this.teamsService.getAllTeams(userEmail);

        return equipos;
      }
      catch (error) {
      throw new NotFoundException(`No se pudo obtener a los equipos`);
    }
    }
    
    @Get(':id/miembros')
    async getMiembrosDeEquipo(@Param('id') id: number) {
      
      try{
        const equipo = await this.equipoRepository.createQueryBuilder('equipo')
      .leftJoinAndSelect('equipo.miembros', 'miembros')
      .where('equipo.id = :id', { id })
      .getOne();

      if (!equipo) {
        throw new NotFoundException('Equipo no encontrado');
      }

      return equipo.miembros;
        
      }
      catch (error) {
      throw new NotFoundException(`No se pudo obtener al equipo`);
    }
    }
    


    @Patch('editarteam/:equipoId')
    @UseGuards(AuthGuard)
    editarPerfil(@Request() req, @Body() editTeamDto: EditTeamDto, @Param('equipoId', ParseIntPipe) equipoId: number): Promise<Equipo> {
      const userEmail = req.user.email; // Obtén el email del usuario autenticado desde el token
      console.log('Usuario autenticado:', req.user.email);
      
      try{
        // Llama a la función de edición del servicio
      const equipoActualizado = this.teamsService.editarEquipo(userEmail, editTeamDto, equipoId);

      return equipoActualizado;

      }
      catch (error) {
        throw new NotFoundException(`No se pudo editar el equipo`);
      }
      
    }

    
   
    @Post("crearTeam")
    @UseGuards(AuthGuard)
    async createEquipo(@Request() req, @Body() createTeamDto: CreateTeamDto): Promise<Equipo> {
        const userId = req.user.id;
        const { name, descripcion } = createTeamDto;   
        try{
          const equipo = await this.teamsService.createTeam(userId, name, descripcion);
          return equipo;
        }
        catch (error) {
          throw new NotFoundException(`No se pudo crear el equipo`);
        }
    }
    @Delete(':name')
    deleteTeamByName(@Param('name') name: string): Promise<string> {
      return this.teamsService.deleteTeamByName(name);
    }


    
    @Post('addMember')
    @UseGuards(AuthGuard)
    async addMember(@Request() req, @Body() addUserDto: AddUserTeamDto): Promise<Equipo> {
    const userId = req.user.id;
    try{
      return await this.teamsService.addMember(userId, addUserDto);
    }
    catch (error) {
      throw new NotFoundException(`No se pudo añadir un miembro al equipo`);
    }
    }

    @Post('removemember')
    @UseGuards(AuthGuard)
    async removeMember(@Body() removeUserDto: RemoveUserTeamDto) {
      try{
        return this.teamsService.removeMember(removeUserDto);
      }
      catch (error) {
        throw new NotFoundException(`No se pudo remover un miembro al equipo`);
      }
    }


}