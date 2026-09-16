export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      dataroom_documents: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          listing_id: string
          name: string
          size_bytes: number | null
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          listing_id: string
          name: string
          size_bytes?: number | null
          storage_path: string
          uploaded_by?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          listing_id?: string
          name?: string
          size_bytes?: number | null
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "dataroom_documents_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      document_access_log: {
        Row: {
          accessed_at: string
          document_id: string
          id: number
          user_id: string
        }
        Insert: {
          accessed_at?: string
          document_id: string
          id?: never
          user_id: string
        }
        Update: {
          accessed_at?: string
          document_id?: string
          id?: never
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_access_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "dataroom_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_interests: {
        Row: {
          buyer_id: string
          created_at: string
          decided_at: string | null
          id: string
          listing_id: string
          message: string
          status: Database["public"]["Enums"]["interest_status"]
          updated_at: string
        }
        Insert: {
          buyer_id?: string
          created_at?: string
          decided_at?: string | null
          id?: string
          listing_id: string
          message: string
          status?: Database["public"]["Enums"]["interest_status"]
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          decided_at?: string | null
          id?: string
          listing_id?: string
          message?: string
          status?: Database["public"]["Enums"]["interest_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_interests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_ndas: {
        Row: {
          body: string
          created_at: string
          created_by: string
          id: string
          listing_id: string
          version: number
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string
          id?: string
          listing_id: string
          version: number
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string
          id?: string
          listing_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "listing_ndas_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          asking_price_minor: number | null
          country: string
          created_at: string
          created_by: string
          currency: string
          description: string
          employees: number | null
          founded_year: number | null
          id: string
          industry: string
          is_demo: boolean
          organization_id: string
          published_at: string | null
          region: string
          revenue_minor: number | null
          review_note: string | null
          status: Database["public"]["Enums"]["listing_status"]
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          asking_price_minor?: number | null
          country: string
          created_at?: string
          created_by?: string
          currency: string
          description?: string
          employees?: number | null
          founded_year?: number | null
          id?: string
          industry: string
          is_demo?: boolean
          organization_id: string
          published_at?: string | null
          region?: string
          revenue_minor?: number | null
          review_note?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          summary?: string
          title: string
          updated_at?: string
        }
        Update: {
          asking_price_minor?: number | null
          country?: string
          created_at?: string
          created_by?: string
          currency?: string
          description?: string
          employees?: number | null
          founded_year?: number | null
          id?: string
          industry?: string
          is_demo?: boolean
          organization_id?: string
          published_at?: string | null
          region?: string
          revenue_minor?: number | null
          review_note?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_country_currency_fkey"
            columns: ["country", "currency"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["country", "currency"]
          },
          {
            foreignKeyName: "listings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          country: string
          currency: string
          decimal_digits: number
          launched: boolean
        }
        Insert: {
          country: string
          currency: string
          decimal_digits: number
          launched?: boolean
        }
        Update: {
          country?: string
          currency?: string
          decimal_digits?: number
          launched?: boolean
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          interest_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          interest_id: string
          sender_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          interest_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "listing_interests"
            referencedColumns: ["id"]
          },
        ]
      }
      nda_acceptances: {
        Row: {
          accepted_at: string
          id: string
          nda_id: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          nda_id: string
          user_id?: string
        }
        Update: {
          accepted_at?: string
          id?: string
          nda_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nda_acceptances_nda_id_fkey"
            columns: ["nda_id"]
            isOneToOne: false
            referencedRelation: "listing_ndas"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          organization_id: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          organization_id: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          country: string
          created_at: string
          created_by: string
          id: string
          kind: Database["public"]["Enums"]["organization_kind"]
          name: string
          org_number: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          country: string
          created_at?: string
          created_by?: string
          id?: string
          kind?: Database["public"]["Enums"]["organization_kind"]
          name: string
          org_number: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          country?: string
          created_at?: string
          created_by?: string
          id?: string
          kind?: Database["public"]["Enums"]["organization_kind"]
          name?: string
          org_number?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_country_fkey"
            columns: ["country"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["country"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string
          full_name: string
          id: string
          locale: string
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          full_name?: string
          id: string
          locale?: string
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          full_name?: string
          id?: string
          locale?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_country_fkey"
            columns: ["country"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["country"]
          },
        ]
      }
      saved_searches: {
        Row: {
          countries: string[]
          created_at: string
          id: string
          industries: string[]
          max_price_minor: number | null
          min_price_minor: number | null
          name: string
          notify: boolean
          price_currency: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          countries?: string[]
          created_at?: string
          id?: string
          industries?: string[]
          max_price_minor?: number | null
          min_price_minor?: number | null
          name: string
          notify?: boolean
          price_currency?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          countries?: string[]
          created_at?: string
          id?: string
          industries?: string[]
          max_price_minor?: number | null
          min_price_minor?: number | null
          name?: string
          notify?: boolean
          price_currency?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_document_access: { Args: { p_document: string }; Returns: string }
      review_listing: {
        Args: { p_approve: boolean; p_listing: string; p_note?: string }
        Returns: Database["public"]["Enums"]["listing_status"]
      }
    }
    Enums: {
      interest_status: "pending" | "accepted" | "declined" | "withdrawn"
      listing_status:
        | "draft"
        | "pending_review"
        | "published"
        | "rejected"
        | "sold"
        | "withdrawn"
      member_role: "owner" | "member"
      organization_kind: "company" | "broker"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      interest_status: ["pending", "accepted", "declined", "withdrawn"],
      listing_status: [
        "draft",
        "pending_review",
        "published",
        "rejected",
        "sold",
        "withdrawn",
      ],
      member_role: ["owner", "member"],
      organization_kind: ["company", "broker"],
    },
  },
} as const

