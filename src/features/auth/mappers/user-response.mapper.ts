import { User } from "../entities/user.entity";

export class UserResponseMapper {

    static userResponseMapper = ( user:User ) => {
        return {
            idUser      : user.idUser,
            firstName   : user.firstName,
            lastName    : user.lastName,
            email       : user.email,
            active      : user.active,
            avatarUrl   : user.avatarUrl,
            lastLogin   : user.lastLogin,
            createdAt   : user.createdAt,
            updatedAt   : user.updatedAt,
            menuList    : user.menuRoles.map((mr) => ({
                        idMenu  : mr.idMenu.idMenu,
                        name    : mr.idMenu.name,
                        route   : mr.idMenu.route,
                        icon    : mr.idMenu.icon,
                    }
                )
            ),
            rolesList: Array.from( new Map( user.menuRoles.map((mr) => [
                        mr.idRoles.idRoles, // clave única
                        { idRoles: mr.idRoles.idRoles, name: mr.idRoles.name },
                    ]
                ),
            ).values()),
        };
    };
}