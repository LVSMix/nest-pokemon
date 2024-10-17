import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Param, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id/parse-mongo-id.pipe';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  
  private defaultLimit = this.configService.get<number>('defaultLimit');

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService 
  ){
    console.log(process.env.DEFAULT_LIMIT);
    const defaultLimit = this.configService.get<number>('defaultLimit');
    console.log(this.configService.getOrThrow('defaultLimit'));
  } 

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const {limit = this.defaultLimit, offset} = paginationDto;
    return this.pokemonModel.find()
                            .limit(limit)
                            .skip(offset)
                            .sort({
                              no:1
                            })
                            .select('-__v');
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: +term });
    }
     
    if (isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase() });
    }

    if (!pokemon) throw new NotFoundException(`Pokemon with id, name or no ${term} not found`);
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemon = await this.findOne(term);
      
      if (updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      }

      await pokemon.updateOne(updatePokemonDto,{new: true});

      return {...pokemon.toJSON,...updatePokemonDto};
    } catch (error) {
       this.handleExceptions(error);
    }
  }

  async remove(@Param('id',ParseMongoIdPipe)id: string) {
    /*const pokemon = await this.findOne(id);
    await this.pokemonModel.deleteOne();*/
    //return {id}
    const { deletedCount } = await this.pokemonModel.deleteOne({_id:id});
    if (!deletedCount) throw new NotFoundException(`Pokemon with id ${id} not found`);
    return;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon already exists in db ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error); 
    throw new InternalServerErrorException(`Can't create/update pokemon - Check server logs`);
  }
}
