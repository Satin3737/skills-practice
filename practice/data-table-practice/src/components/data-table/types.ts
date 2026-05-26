import type {ILimit, ISortOrder, IUnknownObject} from '@/types';

export interface IHeadCellProps<T extends IUnknownObject<T>> {
    column: IDataTableColumn<T>;
    sortOrder: ISortOrder;
    sortColumn: keyof T | undefined;
    onSortChange: (column: keyof T) => void;
}

export interface IEmptyDataRowProps {
    colSpan: number;
}

export interface IErrorRowProps {
    colSpan: number;
    error: Error;
}

export interface IDataTableColumn<T extends IUnknownObject<T>> {
    title: string;
    dataKey: keyof T;
    sortable?: boolean;
}

export interface ITablePaginationProps {
    page: number;
    limit: number;
    total: number;
    setPage: (page: number) => void;
    setLimit: (limit: ILimit) => void;
}

export interface ITableSearchProps {
    search: string;
    setSearch: (search: string) => void;
}

export type IOnTableChange<T extends IUnknownObject<T>> = (params: {
    page: number;
    search: string;
    sort: keyof T;
    order: ISortOrder;
}) => void;

export interface IDataTableProps<T extends IUnknownObject<T>> {
    idKey: keyof T;
    title?: string;
    data: T[];
    columns: IDataTableColumn<T>[];
    defaultSortColumn: keyof T;
    isLoading?: boolean;
    error?: Error | null;
    onTableChange?: IOnTableChange<T>;
    pagination?: ITablePaginationProps;
    showSearch?: boolean;
}
