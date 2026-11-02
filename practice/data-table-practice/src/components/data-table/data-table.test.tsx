import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import DataTable from './data-table';
import type {IDataTableColumn, IDataTableProps} from './types';

interface IRow {
    id: number;
    name: string;
    note: string | null;
}

const columns: IDataTableColumn<IRow>[] = [
    {title: 'ID', dataKey: 'id', sortable: true},
    {title: 'Name', dataKey: 'name', sortable: true},
    {title: 'Note', dataKey: 'note'}
];

const data: IRow[] = [
    {id: 1, name: 'Alice', note: 'first'},
    {id: 2, name: 'Bob', note: null}
];

const setup = (props: Partial<IDataTableProps<IRow>> = {}) => {
    const onTableChange = vi.fn();
    const utils = render(
        <DataTable<IRow>
            idKey={'id'}
            data={data}
            columns={columns}
            sort={'name'}
            order={'asc'}
            onTableChange={onTableChange}
            {...props}
        />
    );
    return {onTableChange, user: userEvent.setup(), ...utils};
};

const bodyRows = () => within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row');

describe('DataTable', () => {
    it('renders title, headers and one row per item', () => {
        setup({title: 'People'});

        expect(screen.getByRole('heading', {name: 'People'})).toBeInTheDocument();
        expect(screen.getAllByRole('columnheader').map(th => th.textContent)).toEqual(['ID', 'Name', 'Note']);
        expect(bodyRows()).toHaveLength(2);
        expect(within(bodyRows()[0]).getAllByRole('cell').map(td => td.textContent)).toEqual(['1', 'Alice', 'first']);
    });

    it('renders null cells as empty', () => {
        setup();
        expect(within(bodyRows()[1]).getAllByRole('cell')[2]).toBeEmptyDOMElement();
    });

    it('omits the title, search and pagination unless requested', () => {
        setup();
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('shows the empty row when there is no data', () => {
        setup({data: []});
        expect(screen.getByText('No data')).toHaveAttribute('colspan', '3');
    });

    it('shows the error message when there is no data and an error', () => {
        setup({data: [], error: new Error('Failed to fetch')});
        expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
        expect(screen.queryByText('No data')).not.toBeInTheDocument();
    });

    it('prefers rows over the error when data is present', () => {
        setup({error: new Error('Failed to fetch')});
        expect(screen.queryByText('Failed to fetch')).not.toBeInTheDocument();
        expect(bodyRows()).toHaveLength(2);
    });

    describe('loading', () => {
        it('renders 5 skeleton rows by default instead of data', () => {
            setup({isLoading: true});
            expect(bodyRows()).toHaveLength(5);
            expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        });

        it('renders as many skeleton rows as the pagination limit', () => {
            setup({isLoading: true, pagination: {page: 1, limit: 15, total: 3, setPage: vi.fn(), setLimit: vi.fn()}});
            expect(bodyRows()).toHaveLength(15);
        });
    });

    describe('onTableChange', () => {
        it('does not fire on render', () => {
            const {onTableChange} = setup();
            expect(onTableChange).not.toHaveBeenCalled();
        });

        it('does not throw without a handler', async () => {
            const {user} = setup({onTableChange: undefined});
            await expect(user.click(screen.getByRole('button', {name: 'Name'}))).resolves.not.toThrow();
        });

        it.each([
            ['asc', 'desc'],
            ['desc', 'asc']
        ] as const)('toggles %s to %s when the active column is clicked', async (order, expected) => {
            const {onTableChange, user} = setup({order});

            await user.click(screen.getByRole('button', {name: 'Name'}));
            expect(onTableChange).toHaveBeenCalledExactlyOnceWith({page: 1, search: '', sort: 'name', order: expected});
        });

        it('switches column and resets the order to asc', async () => {
            const {onTableChange, user} = setup({order: 'desc'});

            await user.click(screen.getByRole('button', {name: 'ID'}));
            expect(onTableChange).toHaveBeenCalledExactlyOnceWith({page: 1, search: '', sort: 'id', order: 'asc'});
        });

        it('reports the search text with the current sort', async () => {
            const {onTableChange, user} = setup({showSearch: true, search: 'b', order: 'desc'});

            await user.type(screen.getByPlaceholderText('Search...'), 'o');
            expect(onTableChange).toHaveBeenCalledExactlyOnceWith({page: 1, search: 'bo', sort: 'name', order: 'desc'});
        });

        it('keeps the page when the handler changes identity between renders', async () => {
            const Harness = () => {
                const [page, setPage] = useState(1);
                return (
                    <DataTable<IRow>
                        idKey={'id'}
                        data={data}
                        columns={columns}
                        sort={'name'}
                        order={'asc'}
                        onTableChange={params => {
                            if (params.page !== page) setPage(params.page);
                        }}
                        pagination={{page, limit: 5, total: 3, setPage, setLimit: vi.fn()}}
                    />
                );
            };
            render(<Harness />);

            await userEvent.click(screen.getByRole('button', {name: 'Next page'}));
            expect(screen.getByText('2', {selector: 'span'})).toBeInTheDocument();
        });
    });

    it('only sortable columns render a button', () => {
        setup();
        expect(screen.getAllByRole('button').map(b => b.textContent)).toEqual(['ID', 'Name']);
    });

    it('renders pagination when provided', () => {
        setup({pagination: {page: 3, limit: 10, total: 4, setPage: vi.fn(), setLimit: vi.fn()}});
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toHaveValue('10');
    });
});
