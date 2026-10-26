import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import type {ITablePaginationProps} from '../types';
import TablePagination from './table-pagination';

const setup = (props: Partial<ITablePaginationProps> = {}) => {
    const setPage = vi.fn();
    const setLimit = vi.fn();
    render(<TablePagination page={3} limit={5} total={10} setPage={setPage} setLimit={setLimit} {...props} />);
    return {setPage, setLimit, user: userEvent.setup()};
};

describe('TablePagination', () => {
    it('shows the current page', () => {
        setup({page: 4});
        expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('hides page controls when there are no pages', () => {
        setup({total: 0});
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it.each([
        ['First page', 1],
        ['Previous page', 2],
        ['Next page', 4],
        ['Last page', 10]
    ])('%s navigates to page %i', async (name, expected) => {
        const {setPage, user} = setup();
        await user.click(screen.getByRole('button', {name}));
        expect(setPage).toHaveBeenCalledExactlyOnceWith(expected);
    });

    it('disables first/previous on the first page', () => {
        setup({page: 1});
        expect(screen.getByRole('button', {name: 'First page'})).toBeDisabled();
        expect(screen.getByRole('button', {name: 'Previous page'})).toBeDisabled();
        expect(screen.getByRole('button', {name: 'Next page'})).toBeEnabled();
    });

    it('disables next/last on the last page', () => {
        setup({page: 10});
        expect(screen.getByRole('button', {name: 'Next page'})).toBeDisabled();
        expect(screen.getByRole('button', {name: 'Last page'})).toBeDisabled();
        expect(screen.getByRole('button', {name: 'Previous page'})).toBeEnabled();
    });

    it('offers all limits with the current one selected', () => {
        setup({limit: 15});
        const select = screen.getByRole('combobox');
        expect(select).toHaveValue('15');
        expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(['5', '10', '15', '20', '25']);
    });

    it('changing the limit sets it and resets to page 1', async () => {
        const {setPage, setLimit, user} = setup();
        await user.selectOptions(screen.getByRole('combobox'), '20');
        expect(setLimit).toHaveBeenCalledExactlyOnceWith(20);
        expect(setPage).toHaveBeenCalledExactlyOnceWith(1);
    });
});
