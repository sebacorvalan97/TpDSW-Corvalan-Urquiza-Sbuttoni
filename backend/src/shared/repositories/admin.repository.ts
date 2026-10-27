import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { prisma } from '../prisma.js';
import type { Prisma } from '../../generated/prisma/client.js';
import { isActiveAccountState } from '../utils/account-status.js';

export interface Admin {
    idAdmin: number;
    name: string;
    mail: string;
    passwordHash: string;
    state: string;
}

export type PublicAdmin = Omit<Admin, 'passwordHash'>;

const accountInclude = { administrador: true } as const;
type DatabaseAdmin = Prisma.CuentaGetPayload<{ include: typeof accountInclude }>;

const hashPassword = (password: string): string => {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
};

const checkPassword = (password: string, stored: string): boolean => {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const expected = Buffer.from(hash, 'hex');
    const actual = scryptSync(password, salt, expected.length);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
};

const toPublic = (account: DatabaseAdmin): PublicAdmin => ({
    idAdmin: account.administrador?.idAdministrador ?? 0,
    name: account.administrador?.nombre ?? '',
    mail: account.mail,
    state: account.estado,
});

export const adminRepository = {
    ensureInitialAdmin: async (): Promise<void> => {
        const count = await prisma.administrador.count();
        if (count > 0) return;

        if (
            process.env.NODE_ENV === 'production' &&
            (!process.env.ADMIN_MAIL || !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'admin1234')
        ) {
            throw new Error('Production requires ADMIN_MAIL and a non-default ADMIN_PASSWORD.');
        }

        await adminRepository.createAdmin(
            'Administrador',
            process.env.ADMIN_MAIL ?? 'admin@recetario.com',
            process.env.ADMIN_PASSWORD ?? 'admin1234',
            'active',
        );
    },

    getAllAdmins: async (): Promise<PublicAdmin[]> => {
        const accounts = await prisma.cuenta.findMany({
            where: { administrador: { isNot: null } },
            include: accountInclude,
            orderBy: { idCuenta: 'asc' },
        });
        return accounts.map(toPublic);
    },

    getAdminById: async (idAdmin: number): Promise<PublicAdmin | null> => {
        const account = await prisma.cuenta.findFirst({
            where: { administrador: { is: { idAdministrador: idAdmin } } },
            include: accountInclude,
        });
        return account ? toPublic(account) : null;
    },

    mailExists: async (mail: string, exceptId?: number): Promise<boolean> => {
        const account = await prisma.cuenta.findFirst({
            where: {
                mail,
                administrador: exceptId === undefined
                    ? { isNot: null }
                    : { is: { idAdministrador: { not: exceptId } } },
            },
            select: { idCuenta: true },
        });
        return account !== null;
    },

    createAdmin: async (name: string, mail: string, password: string, state: string): Promise<PublicAdmin> => {
        const account = await prisma.cuenta.create({
            data: {
                mail,
                contrasenia: hashPassword(password),
                estado: state,
                administrador: {
                    create: { nombre: name },
                },
            },
            include: accountInclude,
        });
        return toPublic(account);
    },

    updateAdmin: async (
        idAdmin: number,
        newData: { name?: string; mail?: string; password?: string; state?: string },
    ): Promise<PublicAdmin | null> => {
        const current = await prisma.cuenta.findFirst({
            where: { administrador: { is: { idAdministrador: idAdmin } } },
            include: accountInclude,
        });
        if (!current?.administrador) return null;

        const adminUpdate: Prisma.AdministradorUpdateWithoutCuentaInput = {
            ...(newData.name === undefined ? {} : { nombre: newData.name }),
        };
        await prisma.cuenta.update({
            where: { idCuenta: current.idCuenta },
            data: {
                ...(newData.mail === undefined ? {} : { mail: newData.mail }),
                ...(newData.password ? { contrasenia: hashPassword(newData.password) } : {}),
                ...(newData.state === undefined ? {} : { estado: newData.state }),
                ...(newData.name === undefined ? {} : { administrador: { update: adminUpdate } }),
            },
        });
        const updated = await prisma.cuenta.findUnique({
            where: { idCuenta: current.idCuenta },
            include: accountInclude,
        });
        return updated ? toPublic(updated) : null;
    },

    deleteAdmin: async (idAdmin: number): Promise<boolean> => {
        const deleted = await prisma.cuenta.deleteMany({
            where: { administrador: { is: { idAdministrador: idAdmin } } },
        });
        return deleted.count > 0;
    },

    count: async (): Promise<number> => prisma.administrador.count(),

    countActive: async (): Promise<number> => prisma.cuenta.count({
        where: {
            administrador: { isNot: null },
            estado: { in: ['activo', 'active'] },
        },
    }),

    authenticate: async (mail: string, password: string): Promise<PublicAdmin | null> => {
        const account = await prisma.cuenta.findFirst({
            where: { mail, administrador: { isNot: null } },
            include: accountInclude,
        });
        if (!account || !isActiveAccountState(account.estado) || !checkPassword(password, account.contrasenia)) return null;
        return toPublic(account);
    },
};
