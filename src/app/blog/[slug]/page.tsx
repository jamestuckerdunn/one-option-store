import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getBlogPostBySlug, incrementViewCount, getPublishedBlogPosts } from '@/lib/db/blog';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || post.status !== 'published') {
    return {
      title: 'Post Not Found | One Option',
    };
  }

  return {
    title: `${post.title} | One Option`,
    description: post.meta_description || post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.meta_description || post.excerpt || undefined,
      images: post.featured_image ? [post.featured_image] : undefined,
      type: 'article',
      publishedTime: post.published_at?.toISOString(),
    },
    keywords: post.keywords.length > 0 ? post.keywords.join(', ') : undefined,
  };
}

export const revalidate = 3600;

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || post.status !== 'published') {
    notFound();
  }

  // Increment view count (non-blocking)
  incrementViewCount(post.id).catch(() => {});

  // Get related posts
  const relatedPosts = await getPublishedBlogPosts({ limit: 3 });
  const otherPosts = relatedPosts.filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Article Header */}
        <article>
          <header className="bg-gray-50 py-12 lg:py-16">
            <div className="max-w-3xl mx-auto px-6">
              <Link
                href="/blog"
                className="inline-flex items-center text-sm text-gray-500 hover:text-black transition mb-6"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All Guides
              </Link>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-lg text-gray-500 mb-6">
                  {post.excerpt}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-400">
                {post.published_at && (
                  <time dateTime={post.published_at.toISOString()}>
                    {new Date(post.published_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                )}
                <span>&middot;</span>
                <span>{post.view_count.toLocaleString()} views</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="max-w-4xl mx-auto px-6 -mt-4 mb-8">
              <div className="aspect-[16/9] relative rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={post.featured_image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 896px) 100vw, 896px"
                />
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="max-w-3xl mx-auto px-6 py-8">
            <div
              className="prose prose-lg prose-gray max-w-none
                prose-headings:font-serif prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-600 prose-p:leading-relaxed
                prose-li:text-gray-600
                prose-a:text-black prose-a:font-medium hover:prose-a:text-gray-600
                prose-strong:text-gray-900
                prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
            />

            {/* Keywords/Tags */}
            {post.keywords.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                  Related Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Related Posts */}
        {otherPosts.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="font-serif text-2xl font-bold mb-8">More Guides</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {otherPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group bg-white rounded-2xl p-6 hover:shadow-md transition"
                  >
                    <h3 className="font-serif text-lg font-bold mb-2 group-hover:text-gray-600 transition line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    {relatedPost.excerpt && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-serif text-2xl font-bold mb-4">
              Ready to Shop?
            </h2>
            <p className="text-gray-500 mb-6">
              Browse our curated collection of Amazon&apos;s #1 bestsellers.
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition font-medium"
            >
              Browse Bestsellers
              <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/**
 * Simple Markdown to HTML converter for blog content.
 * For a production site, consider using a library like marked or remark.
 */
function markdownToHtml(markdown: string): string {
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Unordered lists
    .replace(/^\s*[-*]\s+(.*)$/gim, '<li>$1</li>')
    // Wrap consecutive li tags in ul
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Ordered lists (basic)
    .replace(/^\d+\.\s+(.*)$/gim, '<li>$1</li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Wrap in paragraph tags
    .replace(/^(?!<[h|u|o|l])/gim, '<p>')
    .replace(/(?<![>])$/gim, '</p>')
    // Clean up empty paragraphs
    .replace(/<p><\/p>/g, '')
    .replace(/<p>\s*<(h[1-6]|ul|ol|li)/g, '<$1')
    .replace(/<\/(h[1-6]|ul|ol|li)>\s*<\/p>/g, '</$1>');
}
