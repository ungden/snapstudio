/**
 * Demo Mode - allows the app to run without Supabase configuration.
 * When NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not set,
 * the app falls back to mock data so users can explore the UI.
 */

export function isDemoMode(): boolean {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-ref.supabase.co'
  );
}

// ── Mock User & Profile ─────────────────────────────────────────────────────

export const DEMO_USER = {
  id: 'demo-user-00000000-0000-0000-0000-000000000000',
  email: 'demo@snapstudio.app',
  created_at: '2025-01-15T08:00:00.000Z',
  app_metadata: {},
  user_metadata: { full_name: 'Demo User' },
  aud: 'authenticated',
  role: 'authenticated',
} as const;

export const DEMO_PROFILE = {
  id: DEMO_USER.id,
  points_balance: 500,
  full_name: 'Demo User',
  email: 'demo@snapstudio.app',
  subscription_plan: 'pro',
  subscription_expires_at: '2026-12-31T23:59:59.000Z',
  subscription_starts_at: '2025-01-15T08:00:00.000Z',
  images_generated: 48,
  images_limit: 1000,
  created_at: '2025-01-15T08:00:00.000Z',
  updated_at: '2025-06-01T10:00:00.000Z',
  avatar_url: null,
};

// ── Mock Projects ────────────────────────────────────────────────────────────

export const DEMO_PROJECTS = [
  {
    id: 'demo-project-001',
    user_id: DEMO_USER.id,
    name: 'Golden Lotus Tea - 26/01/2025',
    product_name: 'Golden Lotus Tea',
    status: 'completed',
    industry: 'f_b',
    is_public: true,
    created_at: '2025-01-26T09:00:00.000Z',
    updated_at: '2025-01-26T09:05:00.000Z',
  },
  {
    id: 'demo-project-002',
    user_id: DEMO_USER.id,
    name: 'Ruby Lipstick - 20/02/2025',
    product_name: 'Ruby Lipstick',
    status: 'completed',
    industry: 'beauty',
    is_public: true,
    created_at: '2025-02-20T14:00:00.000Z',
    updated_at: '2025-02-20T14:10:00.000Z',
  },
  {
    id: 'demo-project-003',
    user_id: DEMO_USER.id,
    name: 'Basic T-Shirt - 15/03/2025',
    product_name: 'Basic T-Shirt',
    status: 'completed',
    industry: 'fashion',
    is_public: false,
    created_at: '2025-03-15T11:00:00.000Z',
    updated_at: '2025-03-15T11:08:00.000Z',
  },
];

// ── Mock Generated Images ────────────────────────────────────────────────────

export const DEMO_GENERATED_IMAGES = [
  {
    id: 'demo-img-001',
    project_id: 'demo-project-001',
    user_id: DEMO_USER.id,
    image_type: 'display' as const,
    style_name: 'Elegant White',
    title: 'Golden Lotus Tea - Display 1',
    description: 'Elegant display photo on a white background',
    image_url: '/placeholder.svg',
    watermarked_image_url: null,
    prompt_used: 'Product photography of golden lotus tea...',
    is_favorite: true,
    is_public: true,
    is_featured: true,
    is_sample: true,
    industry: 'f_b',
    download_count: 12,
    created_at: '2025-01-26T09:02:00.000Z',
  },
  {
    id: 'demo-img-002',
    project_id: 'demo-project-001',
    user_id: DEMO_USER.id,
    image_type: 'model' as const,
    style_name: 'Lifestyle',
    title: 'Golden Lotus Tea - Model 1',
    description: 'Model photo with a tea-tasting scene',
    image_url: '/placeholder.svg',
    watermarked_image_url: null,
    prompt_used: 'Lifestyle photo with model enjoying tea...',
    is_favorite: false,
    is_public: true,
    is_featured: true,
    is_sample: true,
    industry: 'f_b',
    download_count: 8,
    created_at: '2025-01-26T09:02:30.000Z',
  },
  {
    id: 'demo-img-003',
    project_id: 'demo-project-001',
    user_id: DEMO_USER.id,
    image_type: 'social' as const,
    style_name: 'Instagram Story',
    title: 'Golden Lotus Tea - Social 1',
    description: 'Optimized photo for Instagram Story',
    image_url: '/placeholder.svg',
    watermarked_image_url: null,
    prompt_used: 'Instagram story format product shot...',
    is_favorite: false,
    is_public: true,
    is_featured: true,
    is_sample: false,
    industry: 'f_b',
    download_count: 5,
    created_at: '2025-01-26T09:03:00.000Z',
  },
  {
    id: 'demo-img-004',
    project_id: 'demo-project-001',
    user_id: DEMO_USER.id,
    image_type: 'seeding' as const,
    style_name: 'UGC Style',
    title: 'Golden Lotus Tea - Seeding 1',
    description: 'User-generated content style photo',
    image_url: '/placeholder.svg',
    watermarked_image_url: null,
    prompt_used: 'Natural UGC-style product photo...',
    is_favorite: true,
    is_public: true,
    is_featured: true,
    is_sample: false,
    industry: 'f_b',
    download_count: 3,
    created_at: '2025-01-26T09:03:30.000Z',
  },
  {
    id: 'demo-img-005',
    project_id: 'demo-project-002',
    user_id: DEMO_USER.id,
    image_type: 'display' as const,
    style_name: 'Luxury',
    title: 'Ruby Lipstick - Display 1',
    description: 'Luxury-style lipstick display photo',
    image_url: '/placeholder.svg',
    watermarked_image_url: null,
    prompt_used: 'Luxury lipstick product photo...',
    is_favorite: false,
    is_public: true,
    is_featured: true,
    is_sample: true,
    industry: 'beauty',
    download_count: 15,
    created_at: '2025-02-20T14:02:00.000Z',
  },
  {
    id: 'demo-img-006',
    project_id: 'demo-project-002',
    user_id: DEMO_USER.id,
    image_type: 'model' as const,
    style_name: 'Beauty Shot',
    title: 'Ruby Lipstick - Model 1',
    description: 'Model photo featuring ruby lipstick',
    image_url: '/placeholder.svg',
    watermarked_image_url: null,
    prompt_used: 'Beauty shot with model wearing ruby lipstick...',
    is_favorite: true,
    is_public: true,
    is_featured: true,
    is_sample: true,
    industry: 'beauty',
    download_count: 20,
    created_at: '2025-02-20T14:02:30.000Z',
  },
  {
    id: 'demo-img-007',
    project_id: 'demo-project-002',
    user_id: DEMO_USER.id,
    image_type: 'social' as const,
    style_name: 'TikTok',
    title: 'Ruby Lipstick - Social 1',
    description: 'Optimized photo for TikTok',
    image_url: '/placeholder.svg',
    watermarked_image_url: null,
    prompt_used: 'TikTok optimized beauty product shot...',
    is_favorite: false,
    is_public: true,
    is_featured: true,
    is_sample: false,
    industry: 'beauty',
    download_count: 7,
    created_at: '2025-02-20T14:03:00.000Z',
  },
  {
    id: 'demo-img-008',
    project_id: 'demo-project-002',
    user_id: DEMO_USER.id,
    image_type: 'seeding' as const,
    style_name: 'Review Style',
    title: 'Ruby Lipstick - Seeding 1',
    description: 'Product review style photo',
    image_url: '/placeholder.svg',
    watermarked_image_url: null,
    prompt_used: 'Product review style cosmetics photo...',
    is_favorite: false,
    is_public: true,
    is_featured: true,
    is_sample: false,
    industry: 'beauty',
    download_count: 4,
    created_at: '2025-02-20T14:03:30.000Z',
  },
];

// ── Mock Community Feed ──────────────────────────────────────────────────────

export const DEMO_COMMUNITY_FEED = DEMO_GENERATED_IMAGES
  .filter((img) => img.is_public)
  .map((img) => ({
    ...img,
    like_count: Math.floor(Math.random() * 50) + 5,
    comment_count: Math.floor(Math.random() * 10),
    user_full_name: DEMO_PROFILE.full_name,
    user_avatar_url: null,
  }));

// ── Mock Orders ──────────────────────────────────────────────────────────────

export const DEMO_ORDERS = [
  {
    id: 'demo-order-001',
    user_id: DEMO_USER.id,
    plan_id: 'pro',
    amount: 299000,
    status: 'completed',
    created_at: '2025-01-15T08:00:00.000Z',
    updated_at: '2025-01-15T08:05:00.000Z',
  },
];

// ── Mock Notifications ───────────────────────────────────────────────────────

export const DEMO_NOTIFICATIONS = [
  {
    id: 'demo-notif-001',
    user_id: DEMO_USER.id,
    title: 'Welcome to SnapStudio!',
    message: 'You have received 500 free points to get started.',
    is_read: false,
    created_at: '2025-01-15T08:00:00.000Z',
  },
  {
    id: 'demo-notif-002',
    user_id: DEMO_USER.id,
    title: 'Photo set completed',
    message: 'Project "Golden Lotus Tea" has finished generating 12 images.',
    is_read: true,
    created_at: '2025-01-26T09:05:00.000Z',
  },
];

// ── Mock Points Ledger ───────────────────────────────────────────────────────

export const DEMO_POINTS_LEDGER = [
  {
    id: 'demo-ledger-001',
    user_id: DEMO_USER.id,
    delta: 500,
    reason: 'Account registration - Bonus points',
    created_at: '2025-01-15T08:00:00.000Z',
  },
  {
    id: 'demo-ledger-002',
    user_id: DEMO_USER.id,
    delta: -120,
    reason: 'Photo set generation - Golden Lotus Tea',
    created_at: '2025-01-26T09:01:00.000Z',
  },
  {
    id: 'demo-ledger-003',
    user_id: DEMO_USER.id,
    delta: -120,
    reason: 'Photo set generation - Ruby Lipstick',
    created_at: '2025-02-20T14:01:00.000Z',
  },
];

// ── Mock Admin Data ──────────────────────────────────────────────────────────

export const DEMO_PROMPT_TEMPLATES = [
  {
    id: 'demo-template-001',
    name: 'Display - White Background',
    industry: 'f_b',
    category: 'display',
    prompt_template: 'Product photography on clean white background...',
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-template-002',
    name: 'Model - Lifestyle',
    industry: 'beauty',
    category: 'model',
    prompt_template: 'Beautiful model in lifestyle setting...',
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
  },
];

// ── Helper: lookup mock data by table name ───────────────────────────────────

export function getMockDataForTable(table: string): any[] {
  switch (table) {
    case 'profiles':
      return [DEMO_PROFILE];
    case 'projects':
      return [...DEMO_PROJECTS];
    case 'generated_images':
      return [...DEMO_GENERATED_IMAGES];
    case 'community_feed':
      return [...DEMO_COMMUNITY_FEED];
    case 'community_comments':
      return [];
    case 'community_likes':
      return [];
    case 'user_follows':
      return [];
    case 'orders':
      return [...DEMO_ORDERS];
    case 'notifications':
      return [...DEMO_NOTIFICATIONS];
    case 'points_ledger':
      return [...DEMO_POINTS_LEDGER];
    case 'prompt_templates':
      return [...DEMO_PROMPT_TEMPLATES];
    case 'usage_logs':
      return [];
    case 'api_keys':
      return [];
    default:
      return [];
  }
}
