import { Prisma, PrismaClient, Country } from '@prisma/client';
import { prisma } from "../db";

/**
 * 
 * @param dataCountry 
 * @returns 
 */
export const validatorCreateCountry = (dataCountry: Prisma.CountryCreateInput) => {
    return Prisma.validator<Prisma.CountryCreateInput>()(
        dataCountry
    );
};

/**
 * 
 * @param id 
 * @returns 
 */
export const validatorGetCountryById = (id: number) => {
    return Prisma.validator<Prisma.CountryWhereUniqueInput>()(
        { id }
    );
};

export const validatorDeleteCountry = (id: number) => {
    return Prisma.validator<Prisma.CountryWhereUniqueInput>()(
        { id }
    );
};

export const validatorUpdateCountry = (id: number, dataCountry: Prisma.CountryUpdateInput) => {
    return Prisma.validator<Prisma.CountryUpdateInput>()(
        dataCountry
    );
};

export const validatorGetCountryByName = (name: Country["name"]) => {
    return Prisma.validator<Country["name"]>()(
        name
    );
};

export const validatorGetCountryByAbbreviation = (abbreviation: Country["abbreviation"]) => {
    return Prisma.validator<Country["abbreviation"]>()(
        abbreviation
    );
};