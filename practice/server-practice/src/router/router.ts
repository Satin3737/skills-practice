import {parseUrl} from '@/helpers';
import {type IMethods, type IStrictMessage, Methods} from '@/types';
import type {IParams, IRegisterRoute, IRoute, IRouteResolve} from './types';

class Router {
    private readonly routes: IRoute[] = [];
    private readonly paramTrigger: string = ':';
    private readonly anyTrigger: string = '*';

    public registerRoute({method, path, handler}: IRegisterRoute): void {
        const segments = this.parseToSegments(path);
        const route: IRoute = {method, path, handler, segments};
        this.routes.push(route);
    }

    public resolveRoute({url, method}: IStrictMessage['req']): IRouteResolve | null {
        const {url: parsedUrl, search} = parseUrl(url);
        const requestSegments = this.parseToSegments(parsedUrl);

        for (const route of this.routes) {
            if (route.method !== method) continue;

            const params: IParams = {};

            const indexOfAnyTrigger = route.segments.indexOf(this.anyTrigger);

            if (indexOfAnyTrigger !== -1) {
                const isPrefixSame = route.segments
                    .slice(0, indexOfAnyTrigger)
                    .every((seg, i) => seg === requestSegments[i]);

                if (isPrefixSame) return {handler: route.handler, params, search};

                continue;
            }

            if (route.segments.length !== requestSegments.length) continue;

            const isRouteMatched = route.segments.every((seg, index) => {
                const requestSegment = requestSegments[index];
                const isParam = seg.startsWith(this.paramTrigger);

                if (isParam) {
                    const paramName = seg.replace(this.paramTrigger, '');
                    params[paramName] = requestSegment;
                    return true;
                } else {
                    return seg === requestSegment;
                }
            });

            if (isRouteMatched) return {handler: route.handler, params, search};
        }

        return null;
    }

    public isMethodAvailable(method: string): method is IMethods {
        return method.toLowerCase() in Methods;
    }

    private parseToSegments(path: string): string[] {
        return path.split('/').filter(Boolean);
    }
}

export default Router;
