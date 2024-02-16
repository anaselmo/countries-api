import { Country, Prisma } from "@prisma/client";
import { prisma } from "../db";
import { NotFoundError, UnauthenticatedError } from "../utils/handleError";
import { validatorCreateCountry, validatorDeleteCountry, validatorGetCountryByAbbreviation, validatorGetCountryById, validatorGetCountryByName, validatorUpdateCountry } from "../validators/countries.validator";

//--------------------------------------------------------------------//
//--------------------------------------------------------------------//

export interface ICountryService {
    getCountry(id: Country["id"]): Promise<CountryOutputUser>;
    getCountries(): Promise<CountryOutputUser[]>;
    updateCountry(
        id: Country["id"], 
        data: Prisma.CountryUpdateInput
    ): Promise<CountryOutputUser>;
    deleteCountry(
        id: Country["id"], 
        hard?: boolean
    ): Promise<CountryOutputUser>;
    createCountry(
        data: Prisma.CountryCreateInput
    ): Promise<CountryOutputUser>;
}

//--------------------------------------------------//

const countryOutputAdmin = {
    id: true,
    abbreviation: true,
    name: true,
    capital: true,
    deleted: true
}

//--------------------------------------------------//

type CountryOutputUser = {
    id:           Country["id"],
    abbreviation: Country["abbreviation"],
    name:         Country["name"],
    capital:      Country["capital"]
}

const countryOutputUser = {
    id: true,
    abbreviation: true,
    name: true,
    capital: true
}

//--------------------------------------------------------------------//

export class CountryService implements ICountryService {
    constructor(private readonly repo: typeof prisma) {} //tb Prisma

    //--------------------------------------------------//

    private async findCountryById(id: Country["id"]) {
        const country = await this.repo.country.findFirst({
            where: validatorGetCountryById(id)
        });

        if (!country) {
            throw new NotFoundError(`Country #${id} not found`);
        } else if (country.deleted) {
            throw new UnauthenticatedError(`You cannot access Country #${id} (soft deleted)`);
        }

        return country;
    }

    //--------------------------------------------------//

    public async getCountry(id: Country["id"]) {
        const country = await this.findCountryById(id);
        const { deleted, ...sanitizedCountry } = country;
        return sanitizedCountry;
    }

    //--------------------------------------------------//

    public async getCountries() {
        const countries = await this.repo.country.findMany({
            where: {
                deleted: false
            }
        });

        if (!countries) {
            throw new Error("Countries not found");
        }

        const sanitizedCountries = countries.map(country => {
            const { deleted, ...sanitizedCountry } = country;
            return sanitizedCountry;
        }); 

        return sanitizedCountries;
    }

    //--------------------------------------------------//

    public async updateCountry(id: Country["id"], data: Prisma.CountryUpdateInput) {
        await this.findCountryById(id);

        const { name, abbreviation, capital } = data;

        // TODO: Preguntar a Germán
        // if (name){ 
        //     const countryWithSameName = await this.repo.country.findUnique({
        //         where: validatorGetCountryByName(name)
        //     });
        //     if (countryWithSameName) {
        //         throw new Error(`Country with name "${name}" already exists`);
        //     }
        // }

        // if (abbreviation) {
        //     const countryWithSameAbbreviation = await this.repo.country.findUnique({
        //         where: validatorGetCountryByAbbreviation(abbreviation)
        //     });
        //     if (countryWithSameAbbreviation) {
        //         throw new Error(`Country with abbreviation "${abbreviation}" already exists`);
        //     }
        // }
        
        const updatedCountry = await this.repo.country.update({
            where: validatorGetCountryById(id),
            data: validatorUpdateCountry(id, {
                name, abbreviation, capital
            }),
            select: countryOutputUser
        });

        return updatedCountry;
    }

    //--------------------------------------------------//

    public async deleteCountry(id: Country["id"], hard?: boolean) {
        const countryToDelete = await this.repo.country.findFirst({
            where: validatorDeleteCountry(id)
        });

        if (!countryToDelete) {
            throw new NotFoundError(`Country #${id} not found`);
        }

        let deletedCountry;
        if (hard) {
            await prisma.visit.deleteMany({
                where: { countryId: id }
            });
            deletedCountry = await prisma.country.delete({
                where: validatorDeleteCountry(id),
                select: countryOutputUser
            });
        } else {
            if (countryToDelete.deleted) {
                throw new UnauthenticatedError(`You do not have permissions to delete Country #${id} (soft delete)`);
            }
            deletedCountry = await this.updateCountry(id, { deleted: true });
        }

        if (!deletedCountry) {
            throw new Error(`Country #${id} could not be (soft) deleted`);
        }

        return deletedCountry;
    }

    //--------------------------------------------------//

    public async createCountry(data: Prisma.CountryCreateInput) {
        const validatedData = validatorCreateCountry(data);

        const { name, abbreviation } = validatedData;
        const countryWithSameName = await this.repo.country.findUnique({
            where: { name }
        });
        if (countryWithSameName) {
            throw new Error(`Country with name "${name}" already exists`);
        }
        const countryWithSameAbbreviation = await this.repo.country.findUnique({
            where: { abbreviation }
        });
        if (countryWithSameAbbreviation) {
            throw new Error(`Country with abbreviation "${abbreviation}" already exists`);
        }

        const newCountry = await this.repo.country.create({
            data: validatorCreateCountry(data)
        });

        return newCountry;
    }

    //--------------------------------------------------//
}