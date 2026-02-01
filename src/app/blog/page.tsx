import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getPublishedBlogPosts } from '@/lib/db/blog';

export const metadata: Metadata = {
  title: 'Buying Guides & Reviews | One Option',
  description: 'Expert buying guides and product reviews to help you find the best products. Curated recommendations based on Amazon bestseller data.',
  openGraph: {
    title: 'Buying Guides & Reviews | One Option',
    description: 'Expert buying guides and product reviews to help you find the best products.',
  },
};

export const revalidate = 3600; // Revalidate every hour

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts({ limit: 20 });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
              Buying Guides
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Expert advice to help you choose the perfect product. Our guides are based on real bestseller data and customer reviews.
            </p>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">
                  Buying guides coming soon. Check back for expert product recommendations!
                </p>
                <Link
                  href="/browse"
                  className="inline-flex items-center mt-6 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition font-medium"
                >
                  Browse Bestsellers
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <article key={post.id} className="group">
                    <Link href={`/blog/${post.slug}`}>
                      <div className="aspect-[16/10] relative rounded-2xl overflow-hidden bg-gray-100 mb-4">
                        {post.featured_image ? (
                          <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <span className="text-4xl font-serif font-bold text-gray-300">
                              Guide
                            </span>
                          </div>
                        )}
                      </div>

                      <h2 className="font-serif text-xl font-bold mb-2 group-hover:text-gray-600 transition line-clamp-2">
                        {post.title}
                      </h2>

                      {post.excerpt && (
                        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        {post.published_at && (
                          <span>
                            {new Date(post.published_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                        <span>{post.view_count.toLocaleString()} views</span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-serif text-2xl font-bold mb-3">
              Get Notified of New Guides
            </h2>
            <p className="text-gray-500 mb-6">
              Subscribe to receive our latest buying guides and product recommendations.
            </p>
            <Link
              href="/#newsletter"
              className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition font-medium"
            >
              Subscribe to Newsletter
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
