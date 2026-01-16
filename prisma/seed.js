const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.productComment.deleteMany();
  await prisma.articleComment.deleteMany();
  await prisma.product.deleteMany();
  await prisma.article.deleteMany();

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'iPhone 14 Pro',
        description: '256GB, Space Black, Excellent condition',
        price: 950000,
        tags: ['electronics', 'smartphone', 'apple']
      }
    }),
    prisma.product.create({
      data: {
        name: 'MacBook Air M2',
        description: 'Barely used, 16GB RAM, 512GB SSD',
        price: 1500000,
        tags: ['electronics', 'laptop', 'apple']
      }
    }),
    prisma.product.create({
      data: {
        name: 'Vintage Leather Jacket',
        description: 'Genuine leather, size L, great vintage condition',
        price: 120000,
        tags: ['fashion', 'vintage', 'leather']
      }
    })
  ]);

  const articles = await Promise.all([
    prisma.article.create({
      data: {
        title: 'Welcome to the Community!',
        content: 'Hello everyone! This is our first post. Feel free to share your thoughts and ideas here.'
      }
    }),
    prisma.article.create({
      data: {
        title: 'Tips for Safe Trading',
        content: 'Here are some important tips to ensure safe transactions: 1) Meet in public places, 2) Check item condition thoroughly, 3) Use secure payment methods.'
      }
    }),
    prisma.article.create({
      data: {
        title: 'Best Deals This Week',
        content: 'Check out the amazing deals we have this week! From electronics to fashion, there is something for everyone.'
      }
    })
  ]);

  await Promise.all([
    prisma.productComment.create({
      data: {
        content: 'Is this still available?',
        productId: products[0].id
      }
    }),
    prisma.productComment.create({
      data: {
        content: 'Great price! Can we negotiate?',
        productId: products[0].id
      }
    }),
    prisma.productComment.create({
      data: {
        content: 'Does it come with original box?',
        productId: products[1].id
      }
    }),
    prisma.articleComment.create({
      data: {
        content: 'Thanks for creating this community!',
        articleId: articles[0].id
      }
    }),
    prisma.articleComment.create({
      data: {
        content: 'Very helpful tips, thank you!',
        articleId: articles[1].id
      }
    })
  ]);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
