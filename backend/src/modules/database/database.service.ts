import { Injectable, Logger } from '@nestjs/common'
import { Redis } from '@upstash/redis'
import { RedisRecordDto } from '../../common/types/RedisRecord.dto'
import { GameDto, MasteryDto } from '../../types'

@Injectable()
export class DatabaseService {
    private readonly logger: Logger
    private readonly redis: Redis

    constructor() {
        this.redis = Redis.fromEnv()
        this.logger = new Logger(this.constructor.name)
    }

    /**
     * ## LIST all the database keys registered
     *
     * @returns Array of all keys in the database
     */
    async list(): Promise<string[]> {
        this.logger.log('Checking all registered keys in redis...')
        const keys = await this.redis.keys('*')

        this.logger.log(`Found ${keys.length} keys!`)
        return keys
    }

    /**
     * ## DELETE ALL database registers
     *
     * @returns Confirmation that the database was deleted
     */
    async deleteAll(): Promise<boolean> {
        const keys = await this.redis.keys('*')

        this.logger.log(`REDIS: Deleting ${keys.length} keys...`)
        await this.redis.flushdb()
        return true
    }

    /**
     * ## DELETE ONE key from the database
     *
     * @param key Key to be deleted
     * @returns Confirmation that the register was deleted
     */
    async deleteOne(key: string): Promise<boolean> {
        this.logger.log(`REDIS: Deleting ${key}...`)
        await this.redis.del(key.toLowerCase())
        return true
    }

    /**
     * ## GET data from a key
     *
     * @param key Key to be searched
     * @returns Data stored in the key
     */
    async getOne(key: string): Promise<RedisRecordDto> {
        const data: RedisRecordDto = await this.redis.get(key.toLowerCase())

        this.logger.log(data ? 'REDIS: Data found!' : 'REDIS: Data not found!')
        return data
    }

    /**
     * ## POST data in a key
     *
     * @param key Key to be stored
     * @param summonerData Data to be stored in the key
     */
    async addOne(key: string, summonerData: GameDto[] | MasteryDto[]) {
        key = key.toLowerCase()
        this.logger.log(`REDIS: saving ${key} data...`)

        // to avoid having too many games in cache
        if (summonerData.length > 50) {
            this.logger.log(`> 50 games in cache (${summonerData.length}), removing the oldest 10`)
            summonerData = summonerData.slice(0, 50)
        }

        const newRecord: RedisRecordDto = {
            ttl: Date.now(),
            data: summonerData,
        }

        await this.redis.set(key, newRecord)
    }

    /**
     * ## GET count of keys in the database
     */
    async count(): Promise<number> {
        this.logger.log('Counting all registered keys in redis...')
        const keys = await this.redis.keys('*')

        this.logger.log(`REDIS: Found ${keys.length} keys!`)
        return keys.length
    }
}
