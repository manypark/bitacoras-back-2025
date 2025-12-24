import { User } from "../entities/user.entity";

export class OnlyUserResponseMapper {

    static cleanUrl = (url?: string | null) => url ? url.replace(/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//, '') : '';

    static userResponseMapper = ( user:User ) => {
        return {
            idUser      : user.idUser,
            user        : {
                firstName   : user.firstName,
                lastName    : user.lastName,
            },
            email       : user.email,
            active      : user.active,
            avatarUrl   : OnlyUserResponseMapper.cleanUrl( user.avatarUrl) ,
            lastLogin   : user.lastLogin,
            createdAt   : user.createdAt,
            updatedAt   : user.updatedAt,
        };
    };
}