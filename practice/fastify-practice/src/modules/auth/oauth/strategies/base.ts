import type {Token} from '@fastify/oauth2';
import type {IOAuthLoginData} from '../types';

abstract class BaseOAuthStrategy {
    public abstract authenticate(params: Token): Promise<IOAuthLoginData>;
}

export default BaseOAuthStrategy;
