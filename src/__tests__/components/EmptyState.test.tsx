import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="No items found"
        description="There are no items to display."
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('There are no items to display.')).toBeInTheDocument();
  });

  it('renders action link when provided', () => {
    render(
      <EmptyState
        title="No items"
        description="No items found"
        action={{ label: 'Browse all', href: '/browse' }}
      />
    );

    const link = screen.getByRole('link', { name: /browse all/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/browse');
  });

  it('does not render action when not provided', () => {
    render(
      <EmptyState
        title="No items"
        description="No items found"
      />
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders search icon for search variant', () => {
    const { container } = render(
      <EmptyState
        icon="search"
        title="No results"
        description="Try a different search"
      />
    );

    // Search icon should be present
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders folder icon by default', () => {
    const { container } = render(
      <EmptyState
        title="Empty"
        description="Nothing here"
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
