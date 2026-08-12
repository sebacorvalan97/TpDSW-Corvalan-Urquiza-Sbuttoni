export interface Dish {
    idDish: number;
    description: string;
    name: string;
}
export declare const dishRepository: {
    getAllDishes: () => Dish[];
    createDish: (description: string, name: string) => Dish;
    updateDish: (idDish: number, newData: Partial<Dish>) => Dish | null;
    deleteDish: (idDish: number) => Dish[] | null;
    getDishById: (idDish: number) => Dish | null;
};
//# sourceMappingURL=dish.repository.d.ts.map