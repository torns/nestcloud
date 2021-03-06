import { Memcached } from './memcached.class';
import { Module, DynamicModule, Global } from '@nestjs/common';
import { IMemcachedOptions } from './interfaces/memcached-options.interface';
import { Boot } from '@nestcloud/boot';
import { ConsulConfig } from '@nestcloud/consul-config';
import {
    NEST_MEMCACHED_PROVIDER,
    NEST_BOOT,
    NEST_CONSUL_CONFIG,
    NEST_BOOT_PROVIDER,
    NEST_CONSUL_CONFIG_PROVIDER,
} from '@nestcloud/common';

@Global()
@Module({})
export class MemcachedModule {
    static register(options: IMemcachedOptions = {}): DynamicModule {
        const inject = [];
        if (options.dependencies.includes(NEST_BOOT)) {
            inject.push(NEST_BOOT_PROVIDER);
        }
        if (options.dependencies.includes(NEST_CONSUL_CONFIG)) {
            inject.push(NEST_CONSUL_CONFIG_PROVIDER);
        }

        const connectionProvider = {
            provide: NEST_MEMCACHED_PROVIDER,
            useFactory: async (config: Boot | ConsulConfig): Promise<Memcached> => {
                if (options.dependencies.includes(NEST_BOOT)) {
                    options = (config as Boot).get('memcached', {});
                }
                if (options.dependencies.includes(NEST_CONSUL_CONFIG)) {
                    options = await (config as ConsulConfig).get('memcached', {});
                }
                return new Memcached(options.uri, options);
            },
            inject,
        };
        return {
            module: MemcachedModule,
            providers: [connectionProvider],
            exports: [connectionProvider],
        };
    }
}
