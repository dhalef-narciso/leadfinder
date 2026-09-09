"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const searches_routes_1 = __importDefault(require("./routes/searches.routes"));
const leads_routes_1 = __importDefault(require("./routes/leads.routes"));
const niches_routes_1 = __importDefault(require("./routes/niches.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Middleware
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express_1.default.json());
// Routes
app.use('/api/searches', searches_routes_1.default);
app.use('/api/leads', leads_routes_1.default);
app.use('/api/niches', niches_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/settings', settings_routes_1.default);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        appName: 'LeadFinder API',
        timestamp: new Date().toISOString()
    });
});
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`LeadFinder Backend running on port ${PORT}`);
        console.log(`Active Search Provider: ${process.env.SEARCH_PROVIDER || 'mock'}`);
    });
}
exports.default = app;
