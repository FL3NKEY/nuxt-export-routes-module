import { extractComponentOption } from './utils';
const fs = require('fs-extra');
const path = require('path');

export default function(moduleOptions = {}) {
    const nuxtInstance = this;
    const jsonRoutesPath = path.resolve(nuxtInstance.options.buildDir, path.join('dist', 'exported-routes.json'));

    nuxtInstance.extendRoutes((routes) => {
        const savedRoutes = routes.map((route) => {
            const options = extractComponentOption(route.component, 'routeOptions');

            return {
                path: route.path,
                ...options
            };
        });

        fs.outputJsonSync(jsonRoutesPath, savedRoutes);
    });

    nuxtInstance.addServerMiddleware({
        path: moduleOptions.path || '/exported-routes',
        async handler(req, res, next) {
            try {
                res.setHeader('Content-Type', 'application/json');

                const savedRoutes = fs.readJsonSync(jsonRoutesPath, { throws: false });
                res.end(JSON.stringify(savedRoutes));
            } catch (err) {
                next(err);
            }
        }
    });
}
