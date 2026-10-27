import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { HttpError } from '../errors/http-error.js';
import { prisma } from '../prisma.js';
import type { Prisma } from '../../generated/prisma/client.js';
import { isActiveAccountState } from '../utils/account-status.js';

export interface User {
    idUser: number;
    name: string;
    birth: string;
    passwordHash: string;
    state: string;
    mail: string;
    bio: string;
}

export type PublicUser = Omit<User, 'passwordHash'>;
export type AuthenticationResult =
    | { status: 'authenticated'; user: PublicUser }
    | { status: 'inactive' };

const accountInclude = { usuario: true } as const;

type DatabaseUser = Prisma.CuentaGetPayload<{ include: typeof accountInclude }>;

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

const toPublic = (account: DatabaseUser): PublicUser => ({
    idUser: account.idCuenta,
    name: [account.usuario?.nombre, account.usuario?.apellido].filter(Boolean).join(' '),
    birth: account.usuario?.fechaNacimiento?.toISOString().slice(0, 10) ?? '',
    state: account.estado,
    mail: account.mail,
    bio: account.usuario?.biografia ?? '',
});

const toDate = (birth: string): Date | null => {
    if (!birth.trim()) return null;
    const date = new Date(`${birth}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) throw new HttpError(400, 'La fecha de nacimiento no es válida.');
    return date;
};

export const userRepository = {
    getAllUsers: async (): Promise<PublicUser[]> => {
        const accounts = await prisma.cuenta.findMany({
            where: { usuario: { isNot: null } },
            include: accountInclude,
            orderBy: { idCuenta: 'asc' },
        });
        return accounts.map(toPublic);
    },

    mailExists: async (mail: string, exceptId?: number): Promise<boolean> => {
        const account = await prisma.cuenta.findFirst({
            where: {
                mail,
                ...(exceptId === undefined ? {} : { idCuenta: { not: exceptId } }),
            },
            select: { idCuenta: true },
        });
        return account !== null;
    },

    authenticate: async (mail: string, password: string): Promise<AuthenticationResult | null> => {
        const account = await prisma.cuenta.findFirst({
            where: { mail, usuario: { isNot: null } },
            include: accountInclude,
        });
        if (!account || !checkPassword(password, account.contrasenia)) return null;
        if (!isActiveAccountState(account.estado)) return { status: 'inactive' };
        return { status: 'authenticated', user: toPublic(account) };
    },

    getById: async (idUser: number): Promise<PublicUser | null> => {
        const account = await prisma.cuenta.findFirst({
            where: { idCuenta: idUser, usuario: { isNot: null } },
            include: accountInclude,
        });
        return account ? toPublic(account as DatabaseUser) : null;
    },

    createUser: async (
        name: string,
        birth: string,
        password: string,
        state: string,
        mail: string,
        bio: string,
    ): Promise<PublicUser> => {
        const account = await prisma.cuenta.create({
            data: {
                mail,
                contrasenia: hashPassword(password),
                estado: state,
                usuario: {
                    create: {
                        nombre: name,
                        apellido: '',
                        fechaNacimiento: toDate(birth),
                        biografia: bio,
                    },
                },
            },
            include: accountInclude,
        });
        return toPublic(account);
    },

    updateUser: async (
        idUser: number,
        newData: Partial<Pick<User, 'name' | 'birth' | 'state' | 'mail' | 'bio'>> & { password?: string },
    ): Promise<PublicUser | null> => {
        const current = await prisma.cuenta.findFirst({
            where: { idCuenta: idUser, usuario: { isNot: null } },
            include: accountInclude,
        });
        if (!current?.usuario) return null;

        const [firstName = '', ...lastName] = (newData.name ?? current.usuario.nombre + (current.usuario.apellido ? ` ${current.usuario.apellido}` : '')).trim().split(/\s+/);
        const userUpdate: Prisma.UsuarioUpdateWithoutCuentaInput = {
            ...(newData.name === undefined ? {} : { nombre: firstName, apellido: lastName.join(' ') }),
            ...(newData.birth === undefined ? {} : { fechaNacimiento: toDate(newData.birth) }),
            ...(newData.bio === undefined ? {} : { biografia: newData.bio }),
        };
        await prisma.cuenta.update({
            where: { idCuenta: idUser },
            data: {
                ...(newData.mail === undefined ? {} : { mail: newData.mail }),
                ...(newData.state === undefined ? {} : { estado: newData.state }),
                ...(newData.password ? { contrasenia: hashPassword(newData.password) } : {}),
                usuario: { update: userUpdate },
            },
        });
        const updated = await prisma.cuenta.findUnique({
            where: { idCuenta: idUser },
            include: accountInclude,
        });
        return updated ? toPublic(updated) : null;
    },

    deleteUser: async (idUser: number): Promise<boolean> => {
        const deleted = await prisma.cuenta.deleteMany({
            where: { idCuenta: idUser, usuario: { isNot: null } },
        });
        return deleted.count > 0;
    },

    getUserById: async (idUser: number): Promise<PublicUser | null> => userRepository.getById(idUser),
};
