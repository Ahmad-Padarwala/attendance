import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration to assign tickets to AVX project...');

    // 1. Find the AVX project
    const projectName = 'AVX';
    const project = await prisma.project.findFirst({
        where: {
            name: {
                equals: projectName,
                // case insensitivity might depend on DB collation, 
                // but exact match is safest for now as user typed "AVX"
            }
        }
    });

    if (!project) {
        console.error(`Error: Project "${projectName}" not found. Please create it first.`);
        return;
    }

    console.log(`Found project "${project.name}" with ID: ${project.id}`);

    // 2. Update all tickets to belong to this project
    // User said "all the current ticket", so we'll update all of them.
    const updateResult = await prisma.ticket.updateMany({
        data: {
            projectId: project.id
        }
    });

    console.log(`Successfully assigned ${updateResult.count} tickets to project "${project.name}".`);
}

main()
    .catch((e) => {
        console.error('Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
