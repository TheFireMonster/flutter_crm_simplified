"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs_1 = require("fs");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const flutterBuildPath = (0, path_1.join)(__dirname, '..', '..', 'build', 'web');
    if (process.env.NODE_ENV !== 'production') {
        console.log('🔍 Flutter build path:', flutterBuildPath);
        console.log('📁 Path exists:', (0, fs_1.existsSync)(flutterBuildPath));
        console.log('📄 Index.html exists:', (0, fs_1.existsSync)((0, path_1.join)(flutterBuildPath, 'index.html')));
    }
    app.useStaticAssets(flutterBuildPath, {
        index: false,
    });
    app.use((req, res, next) => {
        if (req.path.startsWith('/chat/') && req.path.endsWith('.js')) {
            const assetPath = req.path.replace('/chat/', '/');
            if (process.env.NODE_ENV !== 'production') {
                console.log('Rewriting asset request:', req.path, '->', assetPath);
            }
            return res.sendFile((0, path_1.join)(flutterBuildPath, assetPath));
        }
        next();
    });
    app.use((req, res, next) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('Request path:', req.path);
        }
        next();
    });
    app.use((req, res, next) => {
        if (req.method === 'GET' &&
            !req.path.startsWith('/api') &&
            !req.path.startsWith('/chat/history') &&
            !req.path.startsWith('/chat/conversations') &&
            !req.path.startsWith('/appointments') &&
            !req.path.includes('.') &&
            req.accepts('html')) {
            return res.sendFile((0, path_1.join)(flutterBuildPath, 'index.html'));
        }
        next();
    });
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(port);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Server running on ${process.env.API_BASE_URL || `http://localhost:${port}`}`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map