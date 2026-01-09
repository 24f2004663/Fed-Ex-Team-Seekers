const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // 1. Create Users (Internal, Agency, Admin)
    const users = [
        { email: 'admin@fedex.com', name: 'FedEx Admin', role: 'ADMIN' },
        { email: 'manager@fedex.com', name: 'Sarah Manager', role: 'MANAGER' },
        { email: 'agent1@fedex.com', name: 'Mike Internal', role: 'INTERNAL' },
        { email: 'agency_alpha@dca.com', name: 'Alpha Collections', role: 'AGENCY', organizationId: 'DCA_001' },
        { email: 'agency_beta@dca.com', name: 'Beta Recovery', role: 'AGENCY', organizationId: 'DCA_002' },
    ];

    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: u,
        });
    }

    console.log(`Created ${users.length} users.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
