// Tipi DB scritti manualmente dallo schema SQL (supabase_schema.sql + 0002_extensions.sql).
// Per rigenerare da Supabase:
//   npx supabase login && pnpm db:types

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: 'user' | 'moderator' | 'admin';
          xp: number;
          level: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: 'user' | 'moderator' | 'admin';
          xp?: number;
          level?: number;
        };
        Update: {
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: 'user' | 'moderator' | 'admin';
          xp?: number;
          level?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      luridi: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          description: string | null;
          address: string | null;
          neighborhood: string | null;
          phone: string | null;
          location: unknown;
          hours: Record<string, [string, string]> | null;
          status: 'pending' | 'approved' | 'rejected';
          rejection_reason: string | null;
          temp_closed: boolean;
          added_by: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string | null;
          description?: string | null;
          address?: string | null;
          neighborhood?: string | null;
          phone?: string | null;
          location: string;
          hours?: Record<string, [string, string]> | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          temp_closed?: boolean;
          added_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
        };
        Update: {
          name?: string;
          slug?: string | null;
          description?: string | null;
          address?: string | null;
          neighborhood?: string | null;
          phone?: string | null;
          location?: string;
          hours?: Record<string, [string, string]> | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          temp_closed?: boolean;
          approved_by?: string | null;
          approved_at?: string | null;
        };
        Relationships: [];
      };
      photos: {
        Row: {
          id: string;
          lurido_id: string;
          user_id: string | null;
          url: string;
          caption: string | null;
          sort_order: number;
          blurhash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lurido_id: string;
          user_id?: string | null;
          url: string;
          caption?: string | null;
          sort_order?: number;
          blurhash?: string | null;
        };
        Update: {
          caption?: string | null;
          sort_order?: number;
          blurhash?: string | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          lurido_id: string;
          user_id: string;
          stars: number;
          body: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lurido_id: string;
          user_id: string;
          stars: number;
          body?: string | null;
          photo_url?: string | null;
        };
        Update: {
          stars?: number;
          body?: string | null;
          photo_url?: string | null;
        };
        Relationships: [];
      };
      dishes: {
        Row: {
          id: string;
          lurido_id: string;
          name: string;
          added_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lurido_id: string;
          name: string;
          added_by?: string | null;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
      dish_votes: {
        Row: {
          id: string;
          dish_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          dish_id: string;
          user_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      saved_luridi: {
        Row: {
          user_id: string;
          lurido_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          lurido_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'approved' | 'rejected' | 'nearby' | 'reply' | 'badge' | 'nottambulo';
          title: string;
          body: string | null;
          lurido_id: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'approved' | 'rejected' | 'nearby' | 'reply' | 'badge' | 'nottambulo';
          title: string;
          body?: string | null;
          lurido_id?: string | null;
          read_at?: string | null;
        };
        Update: {
          read_at?: string | null;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: 'lurido' | 'review' | 'photo';
          target_id: string;
          reason: string;
          resolved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          target_type: 'lurido' | 'review' | 'photo';
          target_id: string;
          reason: string;
          resolved?: boolean;
        };
        Update: {
          resolved?: boolean;
        };
        Relationships: [];
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          emoji: string;
          rule: Record<string, unknown> | null;
          sort_order: number;
        };
        Insert: {
          id: string;
          name: string;
          description: string;
          emoji: string;
          rule?: Record<string, unknown> | null;
          sort_order?: number;
        };
        Update: {
          name?: string;
          description?: string;
          emoji?: string;
          rule?: Record<string, unknown> | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      user_badges: {
        Row: {
          user_id: string;
          badge_id: string;
          unlocked_at: string;
        };
        Insert: {
          user_id: string;
          badge_id: string;
          unlocked_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      expo_push_tokens: {
        Row: {
          user_id: string;
          token: string;
          platform: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          token: string;
          platform: string;
          updated_at?: string;
        };
        Update: {
          token?: string;
          platform?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      review_replies: {
        Row: {
          id: string;
          review_id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          user_id: string;
          body: string;
        };
        Update: {
          body?: string;
        };
        Relationships: [];
      };
      review_helpful: {
        Row: {
          review_id: string;
          user_id: string;
        };
        Insert: {
          review_id: string;
          user_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: {
      luridi_with_stats: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          description: string | null;
          address: string | null;
          neighborhood: string | null;
          phone: string | null;
          location: unknown;
          hours: Record<string, [string, string]> | null;
          status: 'pending' | 'approved' | 'rejected';
          rejection_reason: string | null;
          temp_closed: boolean;
          added_by: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
          avg_rating: number | null;
          review_count: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      nearby_luridi: {
        Args: { lat: number; lng: number; radius_m?: number };
        Returns: Database['public']['Tables']['luridi']['Row'][];
      };
      search_luridi: {
        Args: { q: string; limit_n?: number };
        Returns: Database['public']['Tables']['luridi']['Row'][];
      };
      moderate_lurido: {
        Args: { p_id: string; p_action: string; p_reason?: string | null };
        Returns: undefined;
      };
      is_mod: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      lurido_status: 'pending' | 'approved' | 'rejected';
      user_role: 'user' | 'moderator' | 'admin';
      notif_type: 'approved' | 'rejected' | 'nearby' | 'reply' | 'badge' | 'nottambulo';
      report_target: 'lurido' | 'review' | 'photo';
    };
    CompositeTypes: Record<string, never>;
  };
};
