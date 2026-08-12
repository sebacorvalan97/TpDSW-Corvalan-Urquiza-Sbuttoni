export interface User {
    idUser: number;
    name: string;
    birth: string;
    password: string;
    state: string;
    mail: string;
}
export declare const userRepository: {
    getAllUsers: () => User[];
    createUser: (name: string, birth: string, password: string, state: string, mail: string) => User;
    updateUser: (idUser: number, newData: Partial<User>) => User | null;
    deleteUser: (idUser: number) => User[] | null;
    getUserById: (idUser: number) => User | null;
};
//# sourceMappingURL=user.repository.d.ts.map