export type DurationCategory = "under_30" | "1_2_hours" | "3_plus_hours";
export type IndoorOutdoor = "indoor" | "outdoor" | "either";

export type Interest =
  | "food"
  | "coffee"
  | "books"
  | "films"
  | "gaming"
  | "nature"
  | "museums"
  | "shopping"
  | "cooking"
  | "fitness"
  | "arts_crafts"
  | "music"
  | "exploring"
  | "staying_home"
  | "photography";

export type DateStyle =
  | "cozy"
  | "adventurous"
  | "romantic"
  | "simple"
  | "foodie"
  | "outdoors"
  | "creative"
  | "spontaneous";

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          partner_name: string | null;
          avatar_url: string | null;
          couple_since: string | null;
          couple_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: Relationship[];
      };
      user_preferences: {
        Row: {
          user_id: string;
          interests: Interest[];
          date_styles: DateStyle[];
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["user_preferences"]["Row"]
        > & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["user_preferences"]["Row"]>;
        Relationships: Relationship[];
      };
      activities: {
        Row: {
          id: string;
          title: string;
          description: string;
          duration_category: DurationCategory;
          estimated_minutes: number;
          activity_type: string;
          indoor_outdoor: IndoorOutdoor;
          is_at_home: boolean;
          is_seed: boolean;
          interests: Interest[];
          date_styles: DateStyle[];
          latitude: number | null;
          longitude: number | null;
          place_name: string | null;
          place_address: string | null;
          external_place_id: string | null;
          image_url: string | null;
          emoji: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["activities"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["activities"]["Row"]>;
        Relationships: Relationship[];
      };
      memories: {
        Row: {
          id: string;
          user_id: string;
          couple_id: string | null;
          activity_id: string | null;
          title: string;
          notes: string;
          completed_at: string;
          latitude: number | null;
          longitude: number | null;
          place_name: string | null;
          place_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["memories"]["Row"]> & {
          user_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["memories"]["Row"]>;
        Relationships: Relationship[];
      };
      memory_photos: {
        Row: {
          id: string;
          memory_id: string;
          storage_path: string;
          width: number | null;
          height: number | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["memory_photos"]["Row"]> & {
          memory_id: string;
          storage_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["memory_photos"]["Row"]>;
        Relationships: Relationship[];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          activity_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["favorites"]["Row"]> & {
          user_id: string;
          activity_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["favorites"]["Row"]>;
        Relationships: Relationship[];
      };
      couples: {
        Row: {
          id: string;
          created_by: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["couples"]["Row"]> & {
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["couples"]["Row"]>;
        Relationships: Relationship[];
      };
      couple_invites: {
        Row: {
          id: string;
          couple_id: string;
          created_by: string;
          status: "pending" | "accepted" | "revoked";
          created_at: string;
          expires_at: string;
          accepted_by: string | null;
          accepted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["couple_invites"]["Row"]> & {
          couple_id: string;
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["couple_invites"]["Row"]>;
        Relationships: Relationship[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
