"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const users_entity_1 = require("./users/entities/users.entity");
const customers_entity_1 = require("./customers/entities/customers.entity");
const appointments_entity_1 = require("./appointments/entities/appointments.entity");
const sales_entity_1 = require("./sales/entities/sales.entity");
const service_entity_1 = require("./services/entities/service.entity");
const messages_entity_1 = require("./chat/entities/messages.entity");
const conversations_entity_1 = require("./chat/entities/conversations.entity");
const ai_action_entity_1 = require("./ai-actions/entities/ai-action.entity");
const customer_audit_entity_1 = require("./customers/entities/customer-audit.entity");
(0, dotenv_1.config)();
const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const key of requiredEnv) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DB_URL,
    entities: [users_entity_1.User, customers_entity_1.Customer, appointments_entity_1.Appointment, sales_entity_1.Sale, messages_entity_1.Message, conversations_entity_1.Conversation, service_entity_1.Service, ai_action_entity_1.AiAction, customer_audit_entity_1.CustomerAudit],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
    ssl: {
        rejectUnauthorized: false,
    },
});
dataSource.initialize()
    .then(() => {
    console.log('✅ Database connected');
})
    .catch((err) => {
    console.error('❌ Database connection error:', err);
});
exports.default = dataSource;
//# sourceMappingURL=data-source.js.map