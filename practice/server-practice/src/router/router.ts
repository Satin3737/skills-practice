import {parseUrl} from '@/helpers';
import type {IStrictMessage} from '@/types';
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
            const params = this.matchSegments(route.segments, requestSegments);
            if (params) return {handler: route.handler, params, search};
        }

        return null;
    }

    private matchSegments(routeSegments: string[], requestSegments: string[]): IParams | null {
        const indexOfAnyTrigger = routeSegments.indexOf(this.anyTrigger);
        const hasAnyTrigger = indexOfAnyTrigger !== -1;
        const fixedSegments = hasAnyTrigger ? routeSegments.slice(0, indexOfAnyTrigger) : routeSegments;

        const isLengthMatched = hasAnyTrigger
            ? requestSegments.length >= fixedSegments.length
            : requestSegments.length === fixedSegments.length;

        if (!isLengthMatched) return null;

        const params: IParams = {};

        for (const [index, segment] of fixedSegments.entries()) {
            const requestSegment = requestSegments[index];

            if (segment.startsWith(this.paramTrigger)) {
                params[segment.slice(this.paramTrigger.length)] = requestSegment;
            } else if (segment !== requestSegment) {
                return null;
            }
        }

        if (hasAnyTrigger) params[this.anyTrigger] = requestSegments.slice(indexOfAnyTrigger).join('/');

        return params;
    }

    private parseToSegments(path: string): string[] {
        return path.split('/').filter(Boolean);
    }
}

export default Router;
