export interface IEntityListParams {
    limit: number;
    page: number;
    search?: string;
}

export type IValuesOf<Enum> = Enum[keyof Enum];
