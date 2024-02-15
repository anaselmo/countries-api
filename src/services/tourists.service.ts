import { Tourist, Prisma, Visit, Country, PrismaClient } from "@prisma/client";
import { prisma } from "../db";
import { NotFoundError, UnauthenticatedError } from "../utils/handleError";
import { validatorCreateTourist, validatorDeleteTourist, validatorGetTouristById, validatorLoginTourist, validatorUpdateTourist } from "../validators/tourists.validator";
import { comparePasswords, encrypt } from "../utils/handlePassword";
import { tokenSign } from "../utils/handleJwt";
import { validatorGetVisitById } from "../validators/visits.validator";

//--------------------------------------------------------------------//
//--------------------------------------------------------------------//

export interface ITouristService {
    getTourist(id: Tourist["id"]): Promise<TouristOutputInfoUser>;
    getTourists(): Promise<TouristOutputInfoUser[]>;
    updateTourist(
        id: Tourist["id"], 
        data: Prisma.TouristUpdateInput
    ): Promise<TouristOutputInfoUser>;
    deleteTourist(
        id: Tourist["id"], 
        hard?: boolean
    ): Promise<TouristOutputInfoUser>;
    registerTourist(
        data: Prisma.TouristCreateInput
    ): Promise<TouristResponse>;
    loginTourist(
        data: TouristLoginInput
    ): Promise<TouristResponse>;
}

//--------------------------------------------------//

type TouristOutputInfoAdmin = {
    id: number,
    name: string | null,
    email: string,
    deleted: boolean
}

type TouristOutputInfoUser = {
    id: number,
    name: string | null,
    email: string
}

//--------------------------------------------------//

type TouristLoginInput = {
    name: string | null,
    email: string,
    password: string
}

type TouristResponse = {
    data: TouristOutputInfoUser,
    token: string
}

type PrismaRepositories = "country" | "tourist" | "visit";

//--------------------------------------------------//

const touristOutputInfoAdmin = {
    id: true,
    name: true,
    email: true,
    deleted: true
}

const touristOutputInfoUser = {
    id: true,
    name: true,
    email: true
}

//--------------------------------------------------------------------//

export class TouristService implements ITouristService {
    constructor(private readonly repo: typeof prisma) {}

    //--------------------------------------------------//

    public async getTourist(id: Tourist["id"]) {
        const tourist = await this.repo.tourist.findFirst({
            where: validatorGetTouristById(id),
            select: touristOutputInfoAdmin
        });

        if (!tourist) {
            throw new NotFoundError(`Tourist #${id} not found`);
        }

        if (tourist.deleted) {
            throw new UnauthenticatedError(`You do not have permissions to access Tourist #${id}`);
        }

        const { deleted, ...sanitizedTourist } = tourist;
        return sanitizedTourist;
    }

    //--------------------------------------------------//

    public async getTourists() {
        const tourists = await this.repo.tourist.findMany({
            select: touristOutputInfoAdmin
        });

        if (!tourists) {
            throw new Error("Tourists not found");
        }

        const sanitizedTourists = tourists.map(tourist => {
            const { deleted, ...sanitizedTourist } = tourist;
            return sanitizedTourist;
        }); 

        return sanitizedTourists;
    }

    //--------------------------------------------------//

    public async updateTourist(id: Tourist["id"], data: Prisma.TouristUpdateInput) {
        const touristToUpdate = await this.repo.tourist.findFirst({
            where: validatorGetTouristById(id)
        });

        if (!touristToUpdate) {
            throw new NotFoundError(`Tourist #${id} not found`);
        }

        if (touristToUpdate.deleted || touristToUpdate.id !== id) {
            throw new UnauthenticatedError(`You do not have permissions to update Tourist #${id}`);
        }

        const updatedTourist = await this.repo.tourist.update({
            where: validatorGetTouristById(id),
            data: validatorUpdateTourist(id, data),
            select: touristOutputInfoUser
        });

        return updatedTourist;
    }

    //--------------------------------------------------//

    public async deleteTourist(id: Tourist["id"], hard?: boolean) {
        const touristToDelete = await this.repo.tourist.findFirst({
            where: validatorDeleteTourist(id)
        });

        if (!touristToDelete) {
            throw new NotFoundError(`Tourist #${id} not found`);
        } else if (touristToDelete.id !== id) {
            throw new UnauthenticatedError(`You are not authorized to delete Tourist #${touristToDelete.id}`);
        }

        let deletedTourist;
        if (hard) {
            deletedTourist = await this.repo.tourist.delete({
                where: { id }
            });
        } else {
            if (touristToDelete.deleted) {
                throw new UnauthenticatedError(`You do not have permissions to delete Tourist #${id}`);
            }
            deletedTourist = await this.repo.tourist.update({
                where: validatorGetTouristById(id),
                data: {
                    deleted: true,
                },
                select: touristOutputInfoUser     
            })
        }

        if (!deletedTourist) {
            throw new Error(`Tourist #${id} could not be (soft) deleted`);
        }

        return deletedTourist;
    }

    //--------------------------------------------------//

    public async registerTourist(data: Prisma.TouristCreateInput) {
        const password = await encrypt(data.password);
        const dataWithPasswordHash = {...data, password};

        const newTourist = await this.repo.tourist.create({
            data: validatorCreateTourist(dataWithPasswordHash),
            // select: touristOutputInfo
        });

        if (!newTourist){
            throw new Error(`Tourist could not be registered`);
        }

        const token = await tokenSign(newTourist);
        return {data: newTourist, token};
    }

    //--------------------------------------------------//

    public async loginTourist(data: TouristLoginInput) {
        const validatedData = validatorLoginTourist(data);
        const loggedTourist = await this.repo.tourist.findUnique({
            where: {
                email: validatedData.email
            }
        });

        if (!loggedTourist) {
            throw new NotFoundError(`Tourist not found`);
        }

        const check = await comparePasswords(
            validatedData.password, 
            loggedTourist.password
        );

        if (!check) {
            throw new UnauthenticatedError("Invalid password");
        }

        const token = await tokenSign(loggedTourist);
        return {
            data:loggedTourist, token
        };
    }

    //--------------------------------------------------//

    public async getAllVisits(id: Tourist["id"]) {
        await this.checkExistanceById(this.repo.tourist, id, "tourist");
        const visits = await this.repo.visit.findMany({
            where: { touristId: id }
        });
        if (!visits) {
            throw new NotFoundError(`Tourist #${id} has visited no contries.`)
        }

        return visits;
    }

    //--------------------------------------------------//

    public async getVisitsToCountry(touristId: Tourist["id"], countryId: Country["id"]) {
        const tourist = await this.repo.tourist.findFirst({
            where: { id: touristId }
        });
        if (!tourist) {
            throw new NotFoundError(`Tourist not found`);
        }
        
        const country = await this.repo.country.findFirst({
            where: { id: countryId }
        });
        if (!country) {
            throw new NotFoundError(`Country not found`);
        }

        const visit = await this.repo.visit.findFirst({
            where: { countryId, touristId }
        });
        if (!visit) {
            throw new NotFoundError(`Tourist #${touristId} has not visited Country #${countryId}.`);
        } else if (visit.deleted) {
            throw new UnauthenticatedError(`Tourist #${touristId} not authorized: Visit #${visit.id} was soft deleted`);
        }

        return visit;
    }

    //--------------------------------------------------//

    public async createVisit(touristId: Tourist["id"], countryId: Country["id"], data: Prisma.VisitCreateInput) {
        await this.checkExistanceById(this.repo.tourist, touristId, "tourist");
        await this.checkExistanceById(this.repo.country, countryId, "country");

        const { date } = data;
        if (date){
            await this.checkVisitExistence(date, countryId, touristId);
        }

        const newVisit = await this.repo.visit.create({
            data: {
                ...data,
                country: {
                    connect: { id: countryId},
                },
                tourist: {
                    connect: { id: touristId},
                },
            }
        });
        if (!newVisit) {
            throw new NotFoundError(`Tourist #${touristId} could not create a visit to Country #${countryId}.`);
        }

        return newVisit;
    }

    //--------------------------------------------------//

    public async updateVisit(id: Visit["id"], touristId: Tourist["id"], data: {countryId?: number, date?: Date}) {
        const visitToUpdate = await this.checkExistanceById(this.repo.visit, id, "visit");
        if (visitToUpdate.deleted) {
            throw new UnauthenticatedError(`Tourist #${touristId} not authorized: Visit #${id} was soft deleted`);
        }

        await this.checkExistanceById(this.repo.tourist, touristId, "tourist");

        const { countryId } = data;
        if (countryId) {
            await this.checkExistanceById(this.repo.country, countryId, "country");
        }

        const { date } = data;
        const updatedVisit = await this.repo.visit.update({
            where: { id },
            data: {
                country: {
                    connect: { id: countryId},
                },
                date
            }
        });
        if (!updatedVisit) {
            throw new NotFoundError(`Tourist #${touristId} could not update the Visit #${id}.`);
        }

        console.log(updatedVisit);

        return updatedVisit;
    }

    //--------------------------------------------------//

    public async deleteVisit(id: Visit["id"], touristId: Tourist["id"], hard?: boolean) {
        await this.checkExistanceById(this.repo.tourist, touristId, "tourist");

        const visitToDelete = await this.repo.tourist.findFirst({
            where: validatorDeleteTourist(id)
        });

        if (!visitToDelete) {
            throw new NotFoundError(`Visit #${id} not found`);
        } else if (visitToDelete.id !== id) {
            throw new UnauthenticatedError(`You are not authorized to delete Visit #${visitToDelete.id}`);
        }
        
        let deletedVisit;
        if (hard) {
            deletedVisit = await this.repo.visit.delete({
                where: validatorGetVisitById(id)
            });
        } else {
            if (visitToDelete.deleted) {
                throw new UnauthenticatedError(`Tourist #${touristId} not authorized: Visit #${id} was soft deleted`);
            }
            deletedVisit = await this.repo.visit.update({
                where: validatorGetVisitById(id),
                data: {
                    deleted: true,
                }   
            })
        }

        if (!deletedVisit) {
            throw new Error(`Visit #${id} could not be (soft) deleted`);
        }

        return deletedVisit;
    }

    //--------------------------------------------------//
    //----------------- PRIVATE METHODS ----------------//
    //--------------------------------------------------//
    //TODO: Ver si hay una forma mejor de hacer esto
    private async checkExistanceById(repo: PrismaClient["tourist"] | PrismaClient["country"] | PrismaClient["visit"], 
                                     id: number, 
                                     entityName: PrismaRepositories) {
        let entity;
        
        if (entityName === "tourist") {
            entity = await (repo as PrismaClient["tourist"]).findFirst({ where: { id } });
        } else if (entityName === "country") {
            entity = await (repo as PrismaClient["country"]).findFirst({ where: { id } });
        } else if (entityName === "visit") {
            entity = await (repo as PrismaClient["visit"]).findFirst({ where: { id } });
        }
        if (!entity) {
            throw new NotFoundError(`${entityName} #${id} not found`);
        }
        return entity;
    }

    //--------------------------------------------------//

    private async checkVisitExistence(date: string | Visit["date"], countryId: number, touristId: number) {
        const visitToCreate = await this.repo.visit.findUnique({
            where: {
                date_countryId_touristId: {
                    date,
                    countryId,
                    touristId,
                },
            },
        });
    
        if (visitToCreate) {
            throw new Error(`Visit with Country #${countryId}, Tourist #${touristId} and Date:"${date}" already exists`);
        }
    }
}