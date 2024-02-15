import { Prisma } from '@prisma/client';

/**
 * 
 * @param dataVisit 
 * @returns 
 */
export const validatorCreateVisit = (dataVisit: Prisma.VisitCreateInput) => {
    return Prisma.validator<Prisma.VisitCreateInput>()(
        dataVisit
    );
};

/**
 * 
 * @param id 
 * @returns 
 */
export const validatorGetVisitById = (id: number) => {
    return Prisma.validator<Prisma.VisitWhereUniqueInput>()(
        { id }
    );
};

export const validatorDeleteVisit = (id: number) => {
    return Prisma.validator<Prisma.VisitWhereUniqueInput>()(
        { id }
    );
};

export const validatorUpdateVisit = (id: number, dataVisit: Prisma.VisitUpdateInput) => {
    return Prisma.validator<Prisma.VisitUpdateInput>()(
        dataVisit
    );
};