import type {IDataTableColumn} from '@/components/data-table';
import type {IUser} from './types';

export const columns: IDataTableColumn<IUser>[] = [
    {title: 'ID', dataKey: 'id', sortable: true},
    {title: 'Name', dataKey: 'name', sortable: true},
    {title: 'Email', dataKey: 'email', sortable: true}
];
