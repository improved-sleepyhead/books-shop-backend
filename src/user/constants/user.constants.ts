export const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  password: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
};

export const userWithRelationsSelect = {
  ...userSelect,
  orders: {
    select: {
      id: true,
      status: true,
      totalAmount: true,
      createdAt: true,
    },
  },
  reviews: {
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      book: {
        select: {
          id: true,
          title: true,
          coverUrl: true,
        },
      },
    },
  },
  wishlistItems: {
    select: {
      id: true,
      book: {
        select: {
          id: true,
          title: true,
          coverUrl: true,
          price: true,
        },
      },
      createdAt: true,
    },
  },
};

export const userProfileSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      orders: true,
      reviews: true,
      wishlistItems: true,
    },
  },
};