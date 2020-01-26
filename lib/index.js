import { extractComponentOption } from './utils';
const fs = require('fs-extra');
const path = require('path');

export default function(moduleOptions = {}) {
    const nuxtInstance = this;
    const jsonRoutesPath = !nuxtInstance.options.dev
        ? path.resolve(nuxtInstance.options.buildDir, path.join('dist', 'exported-routes.json'))
        : null;

    let routes = [];

    nuxtInstance.extendRoutes((routes) => {
        routes = routes.map((route) => {
            const options = extractComponentOption(route.component, 'routeOptions');

            return {
                path: route.path,
                ...options
            };
        });

        if (!nuxtInstance.options.dev) {
            fs.outputJsonSync(jsonRoutesPath, routes);
        }
    });

    nuxtInstance.addServerMiddleware({
        path: moduleOptions.path || '/exported-routes',
        async handler(req, res, next) {
            try {
                res.setHeader('Content-Type', 'application/json');

                if (nuxtInstance.options.dev) {
                    res.end(JSON.stringify(routes));
                } else {
                    const savedRoutes = fs.readJsonSync(jsonRoutesPath, { throws: false });
                    res.end(JSON.stringify(savedRoutes));
                }
            } catch (err) {
                next(err);
            }
        }
    });
}
