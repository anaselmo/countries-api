import { Tourist, Prisma, Visit, Country, PrismaClient } from "@prisma/client";
import { prisma } from "../db";
import { NotFoundError, UnauthenticatedError } from "../utils/handleError";
import { validatorCreateTourist, validatorDeleteTourist, validatorGetTouristById, validatorLoginTourist, validatorUpdateTourist } from "../validators/tourists.validator";
import { comparePasswords, encrypt } from "../utils/handlePassword";
import { tokenSign } from "../utils/handleJwt";
import { validatorCreateVisit } from "../validators/visits.validator";
import { DefaultArgs } from "@prisma/client/runtime/library";

//--------------------------------------------------------------------//
//--------------------------------------------------------------------//

export interface ITouristService {
    getTourist(id: Tourist["id"]): Promise<TouristOutputInfo>;
    getTourists(): Promise<TouristOutputInfo[]>;
    updateTourist(
        id: Tourist["id"], 
        data: Prisma.TouristUpdateInput
    ): Promise<TouristOutputInfo>;
    deleteTourist(
        id: Tourist["id"], 
        hard?: boolean
    ): Promise<TouristOutputInfo>;
    registerTourist(
        data: Prisma.TouristCreateInput
    ): Promise<TouristResponse>;
    loginTourist(
        data: TouristLoginInput
    ): Promise<TouristResponse>;
}

//--------------------------------------------------//

type TouristOutputInfo = {
    id: number,
    name: string | null,
    email: string,
    deleted: boolean
}

//--------------------------------------------------//

type TouristLoginInput = {
    name: string | null,
    email: string,
    password: string
}

type TouristResponse = {
    data: TouristOutputInfo,
    token: string
}

type PrismaRepositories = "country" | "tourist" | "visit";

//--------------------------------------------------//

const touristOutputInfo = {
    id: true,
    name: true,
    email: true,
    deleted: true
}

//--------------------------------------------------------------------//

export class TouristService implements ITouristService {
    constructor(private readonly repo: typeof prisma) {}

    //--------------------------------------------------//

    public async getTourist(id: Tourist["id"]) {
        const tourist = await this.repo.tourist.findFirst({
            where: validatorGetTouristById(id)
        });

        if (!tourist) {
            throw new NotFoundError(`Tourist #${id} not found`);
        }

        if (tourist.deleted) {
            throw new UnauthenticatedError(`You do not have permissions to access Tourist #${id}`);
        }

        return tourist;
    }

    //--------------------------------------------------//

    public async getTourists() {
        const tourists = await this.repo.tourist.findMany({
            select: touristOutputInfo
        });

        if (!tourists) {
            throw new Error("Tourists not found");
        }

        return tourists;
    }

    //--------------------------------------------------//

    public async updateTourist(id: Tourist["id"], data: Prisma.TouristUpdateInput) {
        const touristToUpdate = await this.repo.tourist.findFirst({
            where: validatorGetTouristById(id)
        });

        if (!touristToUpdate) {
            throw new NotFoundError(`Tourist #${id} not found`);
        }

        if (touristToUpdate.deleted) {
            throw new UnauthenticatedError(`You do not have permissions to update Tourist #${id}`);
        }

        const updatedTourist = await this.repo.tourist.update({
            where: validatorGetTouristById(id),
            data: validatorUpdateTourist(id, data),
            select: touristOutputInfo
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
                select: touristOutputInfo     
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
        const tourist = this.repo.tourist.findFirst({
            where: { id }
        });
        if (!tourist) {
            throw new NotFoundError(`Tourist not found`);
        }
        
        const visits = this.repo.visit.findMany({
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
        // const tourist = await this.repo.tourist.findFirst({
        //     where: { id: touristId }
        // });
        // if (!tourist) {
        //     throw new NotFoundError(`Tourist not found`);
        // }
        await this.checkExistanceById(this.repo.tourist, touristId, "tourist");
        
        // const country = await this.repo.country.findFirst({
        //     where: { id: countryId }
        // });
        // if (!country) {
        //     throw new NotFoundError(`Country not found`);
        // }
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
        } else if (newVisit.deleted) {
            throw new UnauthenticatedError(`Tourist #${touristId} not authorized: Visit #${newVisit.id} was soft deleted`);
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

        const { countryId, date } = data;
        if (countryId) {
            await this.checkExistanceById(this.repo.country, countryId, "country");
        }

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
            throw new NotFoundError(`${entityName} not found`);
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