import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

async function fillDatabase() {
    console.log("Running migrations...");
    await prisma.$queryRaw`INSERT INTO public.pets_type(id, name) VALUES (1, 'dog');`;
    await prisma.$queryRaw`INSERT INTO public.pets_type(id, name) VALUES (2, 'cat');`;
    await prisma.$queryRaw`INSERT INTO public.pets_type(id, name) VALUES (3, 'bunny');`;
    await prisma.$queryRaw`INSERT INTO public.pets_type(id, name) VALUES (4, 'parrot');`;
    await prisma.$queryRaw`INSERT INTO public.pets_breed(name, "petTypeId") 
                           VALUES ('Pastor Alemán', 1),
                                  ('Labrador', 1),
                                  ('Husky siberiano', 1),
                                  ('Bulldog', 1),
                                  ('Golden retriever', 1),
                                  ('Poodle', 1),
                                  ('Pit Bull', 1),
                                  ('Chihuahua', 1),
                                  ('Doberman', 1),
                                  ('Border Collie', 1),
                                  ('Gato persa', 2),
                                  ('British Shorthair', 2),
                                  ('Siamés', 2),
                                  ('Ragdoll', 2);`;

    // Roles Table
    await prisma.$queryRaw`INSERT INTO public.roles(name) VALUES ('ADMIN'), ('PUBLIC');`;
    
    /*
        To associate a user to ADMIN role 
    */
    // await prisma.user.update({
    //     where: {id: 1},
    //     data: {
    //         roles: {connect: {id: 1}}
    //     }
    // })

}

fillDatabase().then(res => {
    console.log("Finish correctly!");
}).catch(err => {
    console.log('Error:');
    console.log(err);
});