const getPagination = (url: string, page: number, totalPages: number): string => {
    if (!totalPages || totalPages === 1) return '';

    const pagesList = Array.from({length: totalPages})
        .map((_, i) => i + 1)
        .map(pageNum => {
            if (pageNum === page) return `<div class="pagination-current">${pageNum}</div>`;
            return `<a href="${url}?page=${pageNum}" class="pagination-link button button-secondary">${pageNum}</a>`;
        })
        .join('');

    return `
        <nav class="pagination">
            ${pagesList}
        </nav>
    `;
};

export default getPagination;
