import { Tourist, Prisma } from "@prisma/client";
import { prisma } from "../db";
import { NotFoundError, UnauthenticatedError } from "../utils/handleError";
import { validatorCreateTourist, validatorDeleteTourist, validatorGetTouristById, validatorLoginTourist, validatorUpdateTourist } from "../validators/tourists.validator";
import { comparePasswords, encrypt } from "../utils/handlePassword";
import { tokenSign } from "../utils/handleJwt";

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

//--------------------------------------------------//

const touristOutputInfo = {
    id: true,
    name: true,
    email: true,
    deleted: true
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
        const tourists = await this.repository.findMany({
            select: touristOutputInfo
        });

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
            data: validatorUpdateTourist(id, data),
            select: touristOutputInfo
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

        const newTourist = await this.repository.create({
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
        const loggedTourist = await this.repository.findUnique({
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
}