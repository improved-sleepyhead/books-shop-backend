export const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  password: true,
  createdAt: true,
  updatedAt: true,
};

export const userWithVendorProfileSelect = {
  ...userSelect,
  vendorProfile: {
    select: {
      id: true,
      displayName: true,
      subdomain: true,
      createdAt: true,
      updatedAt: true,
    },
  },
};

export const userWithRelationsSelect = {
  ...userWithVendorProfileSelect,
  orders: {
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
  },
  reviews: {
    select: {
      id: true,
      rating: true,
      createdAt: true,
    },
  },
};