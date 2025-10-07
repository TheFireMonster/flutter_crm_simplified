"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const users_entity_1 = require("./users/entities/users.entity");
const customers_entity_1 = require("./customers/entities/customers.entity");
const customer_reports_entity_1 = require("./customer-reports/entities/customer-reports.entity");
const appointments_entity_1 = require("./appointments/entities/appointments.entity");
const sales_entity_1 = require("./sales/entities/sales.entity");
const settings_entity_1 = require("./settings/entities/settings.entity");
const tickets_entity_1 = require("./tickets/entities/tickets.entity");
const messages_entity_1 = require("./chat/entities/messages.entity");
const conversations_entity_1 = require("./chat/entities/conversations.entity");
(0, dotenv_1.config)();
const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const key of requiredEnv) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [users_entity_1.User, customers_entity_1.Customer, appointments_entity_1.Appointment, sales_entity_1.Sale, settings_entity_1.Setting, customer_reports_entity_1.CustomerReport, tickets_entity_1.Ticket, messages_entity_1.Message, conversations_entity_1.Conversation],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
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