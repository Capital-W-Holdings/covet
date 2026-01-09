import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { storeRepository } from '@/lib/repositories';
import { createSuccessResponse, handleApiError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError } from '@/lib/errors';
import { UserRole } from '@/types';
import { z } from 'zod';

const storeSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(1000).optional(),
  tagline: z.string().max(100).optional(),
  logo: z.string().url().optional().or(z.literal('')),
  coverImage: z.string().url().optional().or(z.literal('')),
  contactEmail: z.string().email('Invalid email'),
  contactPhone: z.string().max(20).optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100).optional(),
});

// GET /api/store/settings - Get store settings
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (session.role !== UserRole.STORE_ADMIN) {
      throw new ForbiddenError('Only store admins can access store settings');
    }

    const store = await storeRepository.findByOwnerId(session.userId);
    if (!store) {
      throw new NotFoundError('Store');
    }

    return createSuccessResponse({
      name: store.name,
      slug: store.slug,
      description: store.branding?.description || '',
      tagline: store.branding?.tagline || '',
      logo: store.branding?.logoUrl || '',
      coverImage: store.branding?.coverUrl || '',
      contactEmail: store.contact?.email || '',
      contactPhone: store.contact?.phone || '',
      website: '',
      location: store.contact?.address?.city ? `${store.contact.address.city}, ${store.contact.address.state}` : '',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/store/settings - Update store settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    if (session.role !== UserRole.STORE_ADMIN) {
      throw new ForbiddenError('Only store admins can update store settings');
    }

    const store = await storeRepository.findByOwnerId(session.userId);
    if (!store) {
      throw new NotFoundError('Store');
    }

    const body = await request.json();

    // Validate input
    const parsed = storeSettingsSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    // Update store with nested structure
    const updated = await storeRepository.update(store.id, {
      name: parsed.data.name,
      branding: {
        ...store.branding,
        description: parsed.data.description || undefined,
        tagline: parsed.data.tagline || undefined,
        logoUrl: parsed.data.logo || undefined,
        coverUrl: parsed.data.coverImage || undefined,
      },
      contact: {
        ...store.contact,
        email: parsed.data.contactEmail,
        phone: parsed.data.contactPhone || undefined,
      },
    });

    return createSuccessResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
