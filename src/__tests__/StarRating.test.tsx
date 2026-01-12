import { render, screen } from '@testing-library/react';
import { StarRating } from '@/components/ui/StarRating';

describe('StarRating', () => {
  it('renders five stars', () => {
    render(<StarRating rating={3} />);
    const stars = screen.getAllByRole('img', { hidden: true });
    expect(stars).toHaveLength(5);
  });

  it('applies correct size class for sm size', () => {
    const { container } = render(<StarRating rating={4} size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-3', 'h-3');
  });

  it('applies correct size class for lg size', () => {
    const { container } = render(<StarRating rating={4} size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-6', 'h-6');
  });

  it('fills correct number of stars based on rating', () => {
    const { container } = render(<StarRating rating={3.2} />);
    const filledStars = container.querySelectorAll('.fill-black');
    expect(filledStars).toHaveLength(3);
  });

  it('rounds rating correctly', () => {
    const { container } = render(<StarRating rating={3.7} />);
    const filledStars = container.querySelectorAll('.fill-black');
    expect(filledStars).toHaveLength(4);
  });
});
