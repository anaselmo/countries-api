import { Tourist, Prisma } from "@prisma/client";
import { prisma } from "../db";
import { NotFoundError, UnauthenticatedError } from "../utils/handleError";
import { validatorCreateCountry, validatorDeleteCountry, validatorGetCountryById } from "../validators/countries.validator";
import { validatorCreateTourist, validatorDeleteTourist, validatorGetTouristById } from "../validators/tourists.validator";

//--------------------------------------------------------------------//
//--------------------------------------------------------------------//

export interface ITouristService {
    getTourist(id: Tourist["id"]): Promise<Tourist>;
    getTourists(): Promise<Tourist[]>;
    updateTourist(
        id: Tourist["id"], 
        data: Prisma.TouristUpdateInput
    ): Promise<Tourist>;
    deleteTourist(
        id: Tourist["id"], 
        hard?: boolean
    ): Promise<Tourist>;
    createTourist(
        data: Prisma.TouristCreateInput
    ): Promise<Tourist>;
}

//--------------------------------------------------------------------//

export class TouristService implements ITouristService {
    constructor(private readonly repository: typeof prisma.tourist) {} //tb Prisma

    //--------------------------------------------------//

    public async getTourist(id: Tourist["id"]) {
        const tourist = await this.repository.findFirst({
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
        const tourists = await this.repository.findMany({});

        if (!tourists) {
            throw new Error("Tourists not found");
        }

        return tourists;
    }

    //--------------------------------------------------//

    public async updateTourist(id: Tourist["id"], data: Prisma.TouristUpdateInput) {
        const touristToUpdate = await this.repository.findFirst({
            where: validatorGetTouristById(id)
        });

        if (!touristToUpdate) {
            throw new NotFoundError(`Tourist #${id} not found`);
        }

        if (touristToUpdate.deleted) {
            throw new UnauthenticatedError(`You do not have permissions to update Tourist #${id}`);
        }

        const updatedTourist = await this.repository.update({
            where: validatorGetTouristById(id),
            data
        });

        return updatedTourist;
    }

    //--------------------------------------------------//

    public async deleteTourist(id: Tourist["id"], hard?: boolean) {
        const touristToDelete = await this.repository.findFirst({
            where: validatorDeleteTourist(id)
        });

        if (!touristToDelete) {
            throw new NotFoundError(`Tourist #${id} not found`);
        }

        let deletedTourist;
        if (hard) {
            deletedTourist = await this.repository.delete({
                where: { id }
            });
        } else {
            if (touristToDelete.deleted) {
                throw new UnauthenticatedError(`You do not have permissions to delete Tourist #${id}`);
            }
            deletedTourist = await this.repository.update({
                where: { id },
                data: {
                    deleted: true,
                }            
            })
        }

        if (!deletedTourist) {
            throw new Error(`Tourist #${id} could not be (soft) deleted`);
        }

        return deletedTourist;
    }

    //--------------------------------------------------//

    public async createTourist(data: Prisma.TouristCreateInput) {
        const newTourist = await this.repository.create({
            data: validatorCreateTourist(data)
        });

        return newTourist;
    }
}