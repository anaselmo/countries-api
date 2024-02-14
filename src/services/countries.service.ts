import { Country, Prisma } from "@prisma/client";
import { prisma } from "../db";
import { outputError } from "../utils/handleError";
import { NotFoundError, UnauthenticatedError } from "../utils/handleError";
import { validatorCreateCountry, validatorDeleteCountry, validatorGetCountryById } from "../validators/countries.validator";

//--------------------------------------------------------------------//
//--------------------------------------------------------------------//

export interface ICountryService {
    getCountry(id: Country["id"]): Promise<Country>;
    getCountries(): Promise<Country[]>;
    updateCountry(
        id: Country["id"], 
        data: Prisma.CountryUpdateInput
    ): Promise<Country>;
    deleteCountry(
        id: Country["id"], 
        hard?: boolean
    ): Promise<Country>;
    createCountry(
        data: Prisma.CountryCreateInput
    ): Promise<Country>;
}

//--------------------------------------------------------------------//

export class CountryService implements ICountryService {
    constructor(private readonly repo: typeof prisma) {} //tb Prisma

    //--------------------------------------------------//

    public async getCountry(id: Country["id"]) {
        const country = await this.repo.country.findFirst({
            where: validatorGetCountryById(id)
        });

        if (!country) {
            throw new NotFoundError(`Country #${id} not found`);
        }

        if (country.deleted) {
            throw new UnauthenticatedError(`You do not have permissions to access Country #${id}`);
        }

        return country;
    }

    //--------------------------------------------------//

    public async getCountries() {
        const countries = await this.repo.country.findMany({});

        if (!countries) {
            throw new Error("Countries not found");
        }

        return countries;
    }

    //--------------------------------------------------//

    public async updateCountry(id: Country["id"], data: Prisma.CountryUpdateInput) {
        const countryToUpdate = await this.repo.country.findFirst({
            where: validatorGetCountryById(id)
        });

        if (!countryToUpdate) {
            throw new NotFoundError(`Country #${id} not found`);
        }

        if (countryToUpdate.deleted) {
            throw new UnauthenticatedError(`You do not have permissions to update Country #${id}`);
        }

        const updatedCountry = await this.repo.country.update({
            where: validatorGetCountryById(id),
            data
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
            deletedCountry = await prisma.country.delete({
                where: { id }
            });
        } else {
            if (countryToDelete.deleted) {
                throw new UnauthenticatedError(`You do not have permissions to delete Country #${id}`);
            }
            deletedCountry = await prisma.country.update({
                where: { id },
                data: {
                    deleted: true,
                }            
            })
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
}