import { User } from "../entities/user.entity";

export class UserResponseMapper {

    static cleanUrl = (url?: string | null) =>
        url ? url.replace(/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//, '') : '';

    static userResponseMapper = (user: User) => {

        // 1️⃣ Roles directos del usuario
        const rolesList = user.roles?.map(role => ({
            idRoles: role.idRoles,
            name: role.name,
        })) ?? [];

        // 2️⃣ Menús derivados de los roles (sin repetir)
        const menuMap = new Map<number, any>();

        user.roles?.forEach(role => {
            role.menus?.forEach(menu => {
                if (!menuMap.has(menu.idMenu)) {
                    menuMap.set(menu.idMenu, {
                        idMenu: menu.idMenu,
                        name: menu.name,
                        route: menu.route,
                        icon: menu.icon,
                    });
                }
            });
        });

        const menuList = Array.from(menuMap.values());

        return {
            idUser: user.idUser,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
            },
            email: user.email,
            active: user.active,
            avatarUrl: UserResponseMapper.cleanUrl(user.avatarUrl),
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            menuList,
            rolesList,
        };
    };
}
