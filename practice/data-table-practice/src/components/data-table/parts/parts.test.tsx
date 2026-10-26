import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {SortOrder} from '@/const';
import EmptyDataRow from './empty-data-row';
import ErrorRow from './error-row';
import HeadCell from './head-cell';
import TableSearch from './table-search';

const inTable = (row: React.ReactNode) =>
    render(
        <table>
            <thead>
                <tr>{row}</tr>
            </thead>
            <tbody>{row}</tbody>
        </table>
    );

describe('EmptyDataRow', () => {
    it('spans all columns', () => {
        render(
            <table>
                <tbody>
                    <EmptyDataRow colSpan={4} />
                </tbody>
            </table>
        );
        expect(screen.getByRole('cell', {name: 'No data'})).toHaveAttribute('colspan', '4');
    });
});

describe('ErrorRow', () => {
    it('shows the error message across all columns', () => {
        render(
            <table>
                <tbody>
                    <ErrorRow colSpan={2} error={new Error('Failed to fetch posts')} />
                </tbody>
            </table>
        );
        expect(screen.getByRole('cell', {name: 'Failed to fetch posts'})).toHaveAttribute('colspan', '2');
    });
});

describe('HeadCell', () => {
    const column = {title: 'Name', dataKey: 'name' as const, sortable: true};

    it('renders a plain title when not sortable', () => {
        inTable(
            <HeadCell
                column={{title: 'Name', dataKey: 'name'}}
                sortOrder={SortOrder.asc}
                sortColumn={undefined}
                onSortChange={vi.fn()}
            />
        );
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.getAllByText('Name')).not.toHaveLength(0);
    });

    it('calls onSortChange with the column key when clicked', async () => {
        const onSortChange = vi.fn();
        render(
            <table>
                <thead>
                    <tr>
                        <HeadCell column={column} sortOrder={SortOrder.asc} sortColumn={undefined} onSortChange={onSortChange} />
                    </tr>
                </thead>
            </table>
        );
        await userEvent.click(screen.getByRole('button', {name: 'Name'}));
        expect(onSortChange).toHaveBeenCalledExactlyOnceWith('name');
    });

    it('renders a different icon for unsorted, asc and desc', () => {
        const svgFor = (sortColumn: 'name' | undefined, sortOrder: 'asc' | 'desc') => {
            const {container, unmount} = render(
                <table>
                    <thead>
                        <tr>
                            <HeadCell column={column} sortOrder={sortOrder} sortColumn={sortColumn} onSortChange={vi.fn()} />
                        </tr>
                    </thead>
                </table>
            );
            const html = container.querySelector('svg')!.outerHTML;
            unmount();
            return html;
        };

        const icons = [svgFor(undefined, 'asc'), svgFor('name', 'asc'), svgFor('name', 'desc')];
        expect(new Set(icons).size).toBe(3);
        expect(svgFor(undefined, 'desc')).toBe(icons[0]);
    });
});

describe('TableSearch', () => {
    it('shows the value and reports typed text', async () => {
        const setSearch = vi.fn();
        render(<TableSearch search={'abc'} setSearch={setSearch} />);

        const input = screen.getByPlaceholderText('Search...');
        expect(input).toHaveValue('abc');
        await userEvent.type(input, 'd');
        expect(setSearch).toHaveBeenCalledExactlyOnceWith('abcd');
    });
});
