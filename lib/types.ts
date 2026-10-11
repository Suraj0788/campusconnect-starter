export type Profile = {
  user_id: string;
  full_name: string | null;
  bio: string | null;
  major: string | null;
  graduation_year: number | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PostMedia = {
  id: string;
  post_id: string;
  file_path: string;
  file_type: string;
  original_name: string;
  public_url?: string | null;
};

export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles?: Profile | null;
};

export type Post = {
  id: string;
  author_id: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile | null;
  post_media?: PostMedia[];
  comments?: Comment[];
  likes?: { user_id: string }[];
  like_count?: number;
  comment_count?: number;
};
export const CATEGORIES = ["Events", "Study", "Projects", "Announcements", "Questions", "Other"] as const;
