import { render, screen } from '@testing-library/react';
import { Pagination } from '@/components/ui/Pagination';

describe('Pagination', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} baseUrl="/browse" />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders page links when totalPages > 1', () => {
    render(
      <Pagination currentPage={1} totalPages={5} baseUrl="/browse" />
    );

    expect(screen.getByRole('link', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '5' })).toBeInTheDocument();
  });

  it('marks current page as active', () => {
    render(
      <Pagination currentPage={3} totalPages={5} baseUrl="/browse" />
    );

    const currentLink = screen.getByRole('link', { name: '3' });
    expect(currentLink).toHaveAttribute('aria-current', 'page');
  });

  it('disables previous button on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} baseUrl="/browse" />
    );

    // Previous button should not be a link when on first page
    const prevLinks = screen.queryAllByRole('link', { name: /previous/i });
    expect(prevLinks).toHaveLength(0); // Should be a span, not a link
  });

  it('disables next button on last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} baseUrl="/browse" />
    );

    // Next button should not be a link when on last page
    const nextLinks = screen.queryAllByRole('link', { name: /next/i });
    expect(nextLinks).toHaveLength(0); // Should be a span, not a link
  });

  it('generates correct URLs', () => {
    render(
      <Pagination currentPage={2} totalPages={5} baseUrl="/browse" />
    );

    const page3Link = screen.getByRole('link', { name: '3' });
    expect(page3Link).toHaveAttribute('href', '/browse?page=3');

    const page1Link = screen.getByRole('link', { name: '1' });
    expect(page1Link).toHaveAttribute('href', '/browse');
  });

  it('shows ellipsis for many pages', () => {
    render(
      <Pagination currentPage={5} totalPages={10} baseUrl="/browse" />
    );

    // Should show ellipsis (may have multiple)
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBeGreaterThan(0);
  });
});
