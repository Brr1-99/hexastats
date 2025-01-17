import { Injectable, Logger } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { GameArenaDto, GameDetailDto, GameNormalDto, MasteryDto, PlayerDto, RankDataDto, StatsDto } from '../../common/types'
import { RiotService } from '../../modules/riot/riot.service'
import { DatabaseService } from '../database/database.service'
import { MathService } from '../math/math.service'
import { QueueType } from 'src/common/schemas'

@ApiTags('summoners')
@Injectable()
export class SummonersService {
    private readonly LOGGER = new Logger(this.constructor.name)

    constructor(
        private readonly riotService: RiotService,
        private readonly databaseService: DatabaseService,
        private readonly mathService: MathService,
    ) {}

    /**
     * /summoners/:server/:summonerName
     */
    async getSummoner(server: string, summonerName: string): Promise<RankDataDto> {
        const data = await this.riotService.getBasicInfo(server, summonerName)
        const { solo, flex, arena } = await this.riotService.getRankData(data.id, server)

        return {
            alias: data.name,
            server,
            image: `https://ddragon.leagueoflegends.com/cdn/${this.riotService.version}/img/profileicon/${data.profileIconId}.png`,
            level: data.summonerLevel,
            rank: {
                solo,
                flex,
                arena,
            },
        }
    }

    /**
     * /summoners/:server/:summonerName/level-image
     */
    async getLevelImage(server: string, summonerName: string): Promise<PlayerDto> {
        const data = await this.riotService.getBasicInfo(server, summonerName)

        return {
            alias: data.name,
            server,
            image: `https://ddragon.leagueoflegends.com/cdn/${this.riotService.version}/img/profileicon/${data.profileIconId}.png`,
            level: data.summonerLevel,
        }
    }

    /**
     * /summoners/:server/:summonerName/masteries
     */
    async getMasteries(server: string, summonerName: string, limit: number): Promise<MasteryDto[]> {
        return this.riotService.getMasteries(summonerName, server, limit)
    }

    /**
     * /summoners/:server/:summonerName/games
     */
    async getGames(
        server: string,
        summonerName: string,
        limit: number,
        offset: number,
        queueType: QueueType,
    ): Promise<Array<GameNormalDto | GameArenaDto>> {
        const { puuid } = await this.riotService.getBasicInfo(server, summonerName)

        // Get the list of game IDs
        const games_list = await this.riotService.getGameIds(puuid, server, limit, offset, queueType)

        // Get the game data
        return this.riotService.getGamesDetail(puuid, server, games_list)
    }

    /**
     * /summoners/:server/:summonerName/games):matchId
     */
    async getGameDetail(server: string, summonerName: string, matchId: string): Promise<GameDetailDto> {
        const { puuid } = await this.riotService.getBasicInfo(server, summonerName)

        return this.riotService.getGameDetail(puuid, server, matchId)
    }

    /**
     * /summoners/:server/:summonerName/stats
     */
    async getStats(server: string, summonerName: string): Promise<StatsDto> {
        const gamesFromDB = await this.databaseService.getStats(server, summonerName)

        if (gamesFromDB) {
            const { puuid } = await this.riotService.getBasicInfo(server, summonerName)
            const { is_last, last_game_id } = await this.riotService.isLastGame(server, puuid, String(gamesFromDB.gamesUsed[0]))

            if (is_last) {
                this.LOGGER.log(`${last_game_id} is last game -> returning cached data`)
                return gamesFromDB
            }
            // Option 2
            const games_list = await this.riotService.getGameIds(puuid, server, 10, 0, 'all')
            const result = games_list.filter(match_id => !gamesFromDB.gamesUsed.includes(match_id))

            if (result.length <= 10) {
                const extraGames = await this.getGames(server, summonerName, result.length, 0, 'all')

                const extraOutput: StatsDto = {
                    gamesUsed: extraGames.map(game => game.matchId),
                    friends: this.mathService.getFriends(extraGames),
                    statsByChamp: this.mathService.getStatsByChamp(extraGames),
                    statsByPosition: this.mathService.getStatsByPosition(extraGames),
                    records: this.mathService.getRecords(extraGames),
                    lowRecords: this.mathService.getRecords(extraGames, true),
                }

                const mergedStats = this.mathService.mergeStats(extraOutput, gamesFromDB)

                await this.databaseService.set(`${server}:${summonerName}:stats`, mergedStats)

                return mergedStats
            }
            this.LOGGER.log(`${last_game_id} is NOT last game -> updating cached data with new games`)
        }
        // Option 3
        const games = await this.getGames(server, summonerName, 10, 0, 'all')

        const output: StatsDto = {
            gamesUsed: games.map(game => game.matchId),
            friends: this.mathService.getFriends(games),
            statsByChamp: this.mathService.getStatsByChamp(games),
            statsByPosition: this.mathService.getStatsByPosition(games),
            records: this.mathService.getRecords(games),
            lowRecords: this.mathService.getRecords(games, true),
        }

        await this.databaseService.set(`${server}:${summonerName}:stats`, output)

        return output
    }

    /**
     * /summoners/:server/:summonerName/stats/add
     */
    async addStats(server: string, summonerName: string): Promise<StatsDto> {
        const currentStats = await this.getStats(server, summonerName)

        const games = await this.getGames(server, summonerName, 10, currentStats.gamesUsed.length, 'all')

        const newStats: StatsDto = {
            gamesUsed: games.map(game => game.matchId),
            friends: this.mathService.getFriends(games),
            statsByChamp: this.mathService.getStatsByChamp(games),
            statsByPosition: this.mathService.getStatsByPosition(games),
            records: this.mathService.getRecords(games),
            lowRecords: this.mathService.getRecords(games, true),
        }

        const mergedStats: StatsDto = this.mathService.mergeStats(currentStats, newStats)

        await this.databaseService.set(`${server}:${summonerName}:stats`, mergedStats)

        return mergedStats
    }
}
