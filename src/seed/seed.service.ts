import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interface/poke-response';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosAdapter } from '../common/adapters/axios.adapter';


@Injectable()
export class SeedService {


 constructor(
  @InjectModel(Pokemon.name)
  private readonly pokemonModel: Model<Pokemon> ,
  private readonly http: AxiosAdapter
 ) {}
 
 async  executreSeed1() {
     
    await this.pokemonModel.deleteMany({});
    const data = await this.http.get<PokeResponse>('http://pokeapi.co/api/v2/pokemon?limit=650');

    const insertPromisesArray = [];

    data.results.forEach(async ({name,url}) => { 
       const segments = url.split('/');
       const no: number = +segments[segments.length - 2];
       
       insertPromisesArray.push(
         this.pokemonModel.create({name,no})
       );
       console.log (name,no);
    })

    await Promise.all(insertPromisesArray);
    return 'Seed executed';
  }


  async  executreSeed() {
      
    await this.pokemonModel.deleteMany({});
    const data = await this.http.get<PokeResponse>('http://pokeapi.co/api/v2/pokemon?limit=650');

    const pokemonToInsert : {name:string, no: number}[] = [];

    data.results.forEach(async ({name,url}) => { 
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      
      pokemonToInsert.push({name,no});

      console.log (name,no);
    })

    await this.pokemonModel.insertMany(pokemonToInsert);
    return 'Seed executed';
  }
}

