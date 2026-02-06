export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          reason: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      aml_flags: {
        Row: {
          created_at: string
          currency_exchange_order_id: string | null
          flag_reason: string
          flag_type: string
          id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          status: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          currency_exchange_order_id?: string | null
          flag_reason: string
          flag_type: string
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          status?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          currency_exchange_order_id?: string | null
          flag_reason?: string
          flag_type?: string
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          status?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      beneficiaries: {
        Row: {
          bank_account_number: string | null
          bank_address: string | null
          bank_iban: string | null
          bank_name: string | null
          bank_routing_number: string | null
          bank_swift_code: string | null
          beneficiary_type: string | null
          country: string
          created_at: string
          currency: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bank_account_number?: string | null
          bank_address?: string | null
          bank_iban?: string | null
          bank_name?: string | null
          bank_routing_number?: string | null
          bank_swift_code?: string | null
          beneficiary_type?: string | null
          country: string
          created_at?: string
          currency: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bank_account_number?: string | null
          bank_address?: string | null
          bank_iban?: string | null
          bank_name?: string | null
          bank_routing_number?: string | null
          bank_swift_code?: string | null
          beneficiary_type?: string | null
          country?: string
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      compliance_audit_logs: {
        Row: {
          action_type: string
          admin_user_id: string | null
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          phone: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          phone?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      currency_exchange_orders: {
        Row: {
          admin_rejection_reason: string | null
          advance_amount: number
          advance_paid: boolean | null
          advance_paid_at: string | null
          advance_payment_method: string | null
          advance_reference: string | null
          amount: number
          balance_amount: number
          balance_paid: boolean | null
          balance_paid_at: string | null
          balance_payment_method: string | null
          balance_reference: string | null
          balance_settlement_method: string | null
          balance_settlement_status: string | null
          cancellation_approved_at: string | null
          cancellation_approved_by: string | null
          cancellation_reason: string | null
          cancellation_requested_at: string | null
          city: string
          compliance_notes: string | null
          compliance_reviewed_at: string | null
          compliance_reviewed_by: string | null
          compliance_status: string | null
          converted_amount: number
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          delivery_address: string | null
          delivery_date: string | null
          delivery_preference: string | null
          delivery_time_slot: string | null
          denomination_breakdown: Json | null
          destination_country: string | null
          document_verification_notes: string | null
          document_verification_status: string | null
          document_verified_at: string | null
          document_verified_by: string | null
          documents: Json | null
          exchange_rate: number
          exchange_type: string | null
          from_currency: string
          id: string
          lrs_declaration_accepted: boolean | null
          lrs_declaration_timestamp: string | null
          nationality: string | null
          notes: string | null
          order_number: string | null
          pan_number: string | null
          payee_address: string | null
          payee_name: string | null
          payee_phone: string | null
          purpose: string | null
          rate_confirmed_by_user: boolean | null
          rate_expires_at: string | null
          rate_lock_payment_status: string | null
          rate_locked_at: string | null
          rate_validity_minutes: number | null
          refund_amount: number | null
          refund_reference: string | null
          refund_status: string | null
          return_date_not_finalized: boolean | null
          reupload_requested: boolean | null
          service_fee: number
          settlement_account_name: string | null
          settlement_account_number: string | null
          settlement_bank_name: string | null
          settlement_ifsc: string | null
          settlement_method: string | null
          status: string
          to_currency: string
          total_amount: number
          travel_end_date: string | null
          travel_start_date: string | null
          updated_at: string
          usd_equivalent: number | null
          user_id: string
        }
        Insert: {
          admin_rejection_reason?: string | null
          advance_amount: number
          advance_paid?: boolean | null
          advance_paid_at?: string | null
          advance_payment_method?: string | null
          advance_reference?: string | null
          amount: number
          balance_amount: number
          balance_paid?: boolean | null
          balance_paid_at?: string | null
          balance_payment_method?: string | null
          balance_reference?: string | null
          balance_settlement_method?: string | null
          balance_settlement_status?: string | null
          cancellation_approved_at?: string | null
          cancellation_approved_by?: string | null
          cancellation_reason?: string | null
          cancellation_requested_at?: string | null
          city: string
          compliance_notes?: string | null
          compliance_reviewed_at?: string | null
          compliance_reviewed_by?: string | null
          compliance_status?: string | null
          converted_amount: number
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_preference?: string | null
          delivery_time_slot?: string | null
          denomination_breakdown?: Json | null
          destination_country?: string | null
          document_verification_notes?: string | null
          document_verification_status?: string | null
          document_verified_at?: string | null
          document_verified_by?: string | null
          documents?: Json | null
          exchange_rate: number
          exchange_type?: string | null
          from_currency?: string
          id?: string
          lrs_declaration_accepted?: boolean | null
          lrs_declaration_timestamp?: string | null
          nationality?: string | null
          notes?: string | null
          order_number?: string | null
          pan_number?: string | null
          payee_address?: string | null
          payee_name?: string | null
          payee_phone?: string | null
          purpose?: string | null
          rate_confirmed_by_user?: boolean | null
          rate_expires_at?: string | null
          rate_lock_payment_status?: string | null
          rate_locked_at?: string | null
          rate_validity_minutes?: number | null
          refund_amount?: number | null
          refund_reference?: string | null
          refund_status?: string | null
          return_date_not_finalized?: boolean | null
          reupload_requested?: boolean | null
          service_fee?: number
          settlement_account_name?: string | null
          settlement_account_number?: string | null
          settlement_bank_name?: string | null
          settlement_ifsc?: string | null
          settlement_method?: string | null
          status?: string
          to_currency: string
          total_amount: number
          travel_end_date?: string | null
          travel_start_date?: string | null
          updated_at?: string
          usd_equivalent?: number | null
          user_id: string
        }
        Update: {
          admin_rejection_reason?: string | null
          advance_amount?: number
          advance_paid?: boolean | null
          advance_paid_at?: string | null
          advance_payment_method?: string | null
          advance_reference?: string | null
          amount?: number
          balance_amount?: number
          balance_paid?: boolean | null
          balance_paid_at?: string | null
          balance_payment_method?: string | null
          balance_reference?: string | null
          balance_settlement_method?: string | null
          balance_settlement_status?: string | null
          cancellation_approved_at?: string | null
          cancellation_approved_by?: string | null
          cancellation_reason?: string | null
          cancellation_requested_at?: string | null
          city?: string
          compliance_notes?: string | null
          compliance_reviewed_at?: string | null
          compliance_reviewed_by?: string | null
          compliance_status?: string | null
          converted_amount?: number
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_preference?: string | null
          delivery_time_slot?: string | null
          denomination_breakdown?: Json | null
          destination_country?: string | null
          document_verification_notes?: string | null
          document_verification_status?: string | null
          document_verified_at?: string | null
          document_verified_by?: string | null
          documents?: Json | null
          exchange_rate?: number
          exchange_type?: string | null
          from_currency?: string
          id?: string
          lrs_declaration_accepted?: boolean | null
          lrs_declaration_timestamp?: string | null
          nationality?: string | null
          notes?: string | null
          order_number?: string | null
          pan_number?: string | null
          payee_address?: string | null
          payee_name?: string | null
          payee_phone?: string | null
          purpose?: string | null
          rate_confirmed_by_user?: boolean | null
          rate_expires_at?: string | null
          rate_lock_payment_status?: string | null
          rate_locked_at?: string | null
          rate_validity_minutes?: number | null
          refund_amount?: number | null
          refund_reference?: string | null
          refund_status?: string | null
          return_date_not_finalized?: boolean | null
          reupload_requested?: boolean | null
          service_fee?: number
          settlement_account_name?: string | null
          settlement_account_number?: string | null
          settlement_bank_name?: string | null
          settlement_ifsc?: string | null
          settlement_method?: string | null
          status?: string
          to_currency?: string
          total_amount?: number
          travel_end_date?: string | null
          travel_start_date?: string | null
          updated_at?: string
          usd_equivalent?: number | null
          user_id?: string
        }
        Relationships: []
      }
      kyc_documents: {
        Row: {
          created_at: string
          document_type: string
          id: string
          order_id: string | null
          service_type: string
          status: string
          storage_bucket: string
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          id?: string
          order_id?: string | null
          service_type: string
          status?: string
          storage_bucket: string
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          id?: string
          order_id?: string | null
          service_type?: string
          status?: string
          storage_bucket?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_documents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "currency_exchange_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      lrs_usage: {
        Row: {
          amount_usd: number
          created_at: string
          currency_exchange_order_id: string | null
          financial_year: string
          id: string
          purpose: string
          service_application_id: string | null
          service_type: string
          transaction_date: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_usd?: number
          created_at?: string
          currency_exchange_order_id?: string | null
          financial_year: string
          id?: string
          purpose: string
          service_application_id?: string | null
          service_type: string
          transaction_date?: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_usd?: number
          created_at?: string
          currency_exchange_order_id?: string | null
          financial_year?: string
          id?: string
          purpose?: string
          service_application_id?: string | null
          service_type?: string
          transaction_date?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          kyc_status: string | null
          kyc_submitted_at: string | null
          kyc_verified_at: string | null
          phone: string | null
          sms_notifications_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          kyc_status?: string | null
          kyc_submitted_at?: string | null
          kyc_verified_at?: string | null
          phone?: string | null
          sms_notifications_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          kyc_status?: string | null
          kyc_submitted_at?: string | null
          kyc_verified_at?: string | null
          phone?: string | null
          sms_notifications_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prohibited_purposes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          purpose_code: string
          purpose_name: string
          regulation_reference: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          purpose_code: string
          purpose_name: string
          regulation_reference?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          purpose_code?: string
          purpose_name?: string
          regulation_reference?: string | null
        }
        Relationships: []
      }
      recurring_transfers: {
        Row: {
          beneficiary_id: string | null
          created_at: string
          destination_currency: string
          frequency: string
          id: string
          is_active: boolean
          last_run_at: string | null
          max_runs: number | null
          next_run_at: string
          notes: string | null
          purpose: string | null
          source_amount: number
          source_currency: string
          total_runs: number | null
          transfer_method: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          beneficiary_id?: string | null
          created_at?: string
          destination_currency: string
          frequency: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          max_runs?: number | null
          next_run_at: string
          notes?: string | null
          purpose?: string | null
          source_amount: number
          source_currency?: string
          total_runs?: number | null
          transfer_method?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          beneficiary_id?: string | null
          created_at?: string
          destination_currency?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          max_runs?: number | null
          next_run_at?: string
          notes?: string | null
          purpose?: string | null
          source_amount?: number
          source_currency?: string
          total_runs?: number | null
          transfer_method?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transfers_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      refund_requests: {
        Row: {
          admin_notes: string | null
          bank_account_name: string
          bank_account_number: string
          bank_ifsc: string
          bank_name: string | null
          created_at: string
          id: string
          processed_at: string | null
          processed_by: string | null
          refundable_balance_id: string | null
          rejection_reason: string | null
          requested_amount: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          bank_account_name: string
          bank_account_number: string
          bank_ifsc: string
          bank_name?: string | null
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          refundable_balance_id?: string | null
          rejection_reason?: string | null
          requested_amount: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          bank_account_name?: string
          bank_account_number?: string
          bank_ifsc?: string
          bank_name?: string | null
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          refundable_balance_id?: string | null
          rejection_reason?: string | null
          requested_amount?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_refundable_balance_id_fkey"
            columns: ["refundable_balance_id"]
            isOneToOne: false
            referencedRelation: "refundable_balances"
            referencedColumns: ["id"]
          },
        ]
      }
      refundable_balance_entries: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          entry_type: string
          id: string
          reason: string
          refundable_balance_id: string | null
          source_id: string | null
          source_reference: string | null
          source_type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          entry_type: string
          id?: string
          reason: string
          refundable_balance_id?: string | null
          source_id?: string | null
          source_reference?: string | null
          source_type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          entry_type?: string
          id?: string
          reason?: string
          refundable_balance_id?: string | null
          source_id?: string | null
          source_reference?: string | null
          source_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refundable_balance_entries_refundable_balance_id_fkey"
            columns: ["refundable_balance_id"]
            isOneToOne: false
            referencedRelation: "refundable_balances"
            referencedColumns: ["id"]
          },
        ]
      }
      refundable_balances: {
        Row: {
          balance_amount: number
          created_at: string
          currency: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_amount?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_amount?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_applications: {
        Row: {
          action_required: string | null
          admin_notes: string | null
          application_data: Json | null
          application_status: string
          approved_at: string | null
          card_type: string | null
          created_at: string
          documents: Json | null
          documents_resubmitted_at: string | null
          id: string
          load_amount: number | null
          load_currency: string | null
          rejected_at: string | null
          rejection_reason: string | null
          reupload_reason: string | null
          reupload_requested_at: string | null
          reviewed_at: string | null
          service_type: string
          submitted_at: string | null
          updated_at: string
          usd_equivalent: number | null
          user_id: string
        }
        Insert: {
          action_required?: string | null
          admin_notes?: string | null
          application_data?: Json | null
          application_status?: string
          approved_at?: string | null
          card_type?: string | null
          created_at?: string
          documents?: Json | null
          documents_resubmitted_at?: string | null
          id?: string
          load_amount?: number | null
          load_currency?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          reupload_reason?: string | null
          reupload_requested_at?: string | null
          reviewed_at?: string | null
          service_type: string
          submitted_at?: string | null
          updated_at?: string
          usd_equivalent?: number | null
          user_id: string
        }
        Update: {
          action_required?: string | null
          admin_notes?: string | null
          application_data?: Json | null
          application_status?: string
          approved_at?: string | null
          card_type?: string | null
          created_at?: string
          documents?: Json | null
          documents_resubmitted_at?: string | null
          id?: string
          load_amount?: number | null
          load_currency?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          reupload_reason?: string | null
          reupload_requested_at?: string | null
          reviewed_at?: string | null
          service_type?: string
          submitted_at?: string | null
          updated_at?: string
          usd_equivalent?: number | null
          user_id?: string
        }
        Relationships: []
      }
      service_vouchers: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          id: string
          source_refundable_entry_id: string | null
          status: string
          used_for_order_id: string | null
          used_for_service: string | null
          user_id: string
          voucher_code: string
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at?: string | null
          id?: string
          source_refundable_entry_id?: string | null
          status?: string
          used_for_order_id?: string | null
          used_for_service?: string | null
          user_id: string
          voucher_code: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          source_refundable_entry_id?: string | null
          status?: string
          used_for_order_id?: string | null
          used_for_service?: string | null
          user_id?: string
          voucher_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_vouchers_source_refundable_entry_id_fkey"
            columns: ["source_refundable_entry_id"]
            isOneToOne: false
            referencedRelation: "refundable_balance_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          admin_approved_at: string | null
          admin_approved_by: string | null
          beneficiary_id: string | null
          cancellation_approved_at: string | null
          cancellation_reason: string | null
          cancellation_requested_at: string | null
          completed_at: string | null
          compliance_notes: string | null
          compliance_status: string | null
          created_at: string
          declaration_accepted: boolean | null
          declaration_timestamp: string | null
          destination_amount: number
          destination_currency: string
          destination_wallet_id: string | null
          document_references: string[] | null
          exchange_rate: number | null
          fee_amount: number | null
          fee_currency: string | null
          id: string
          initiated_at: string
          lrs_purpose: string | null
          notes: string | null
          purpose: string | null
          reference_number: string | null
          refund_amount: number | null
          refund_status: string | null
          source_amount: number
          source_currency: string
          source_wallet_id: string | null
          status: string
          transaction_type: string
          updated_at: string
          usd_equivalent: number | null
          user_id: string
        }
        Insert: {
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          beneficiary_id?: string | null
          cancellation_approved_at?: string | null
          cancellation_reason?: string | null
          cancellation_requested_at?: string | null
          completed_at?: string | null
          compliance_notes?: string | null
          compliance_status?: string | null
          created_at?: string
          declaration_accepted?: boolean | null
          declaration_timestamp?: string | null
          destination_amount: number
          destination_currency: string
          destination_wallet_id?: string | null
          document_references?: string[] | null
          exchange_rate?: number | null
          fee_amount?: number | null
          fee_currency?: string | null
          id?: string
          initiated_at?: string
          lrs_purpose?: string | null
          notes?: string | null
          purpose?: string | null
          reference_number?: string | null
          refund_amount?: number | null
          refund_status?: string | null
          source_amount: number
          source_currency: string
          source_wallet_id?: string | null
          status?: string
          transaction_type: string
          updated_at?: string
          usd_equivalent?: number | null
          user_id: string
        }
        Update: {
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          beneficiary_id?: string | null
          cancellation_approved_at?: string | null
          cancellation_reason?: string | null
          cancellation_requested_at?: string | null
          completed_at?: string | null
          compliance_notes?: string | null
          compliance_status?: string | null
          created_at?: string
          declaration_accepted?: boolean | null
          declaration_timestamp?: string | null
          destination_amount?: number
          destination_currency?: string
          destination_wallet_id?: string | null
          document_references?: string[] | null
          exchange_rate?: number | null
          fee_amount?: number | null
          fee_currency?: string | null
          id?: string
          initiated_at?: string
          lrs_purpose?: string | null
          notes?: string | null
          purpose?: string | null
          reference_number?: string | null
          refund_amount?: number | null
          refund_status?: string | null
          source_amount?: number
          source_currency?: string
          source_wallet_id?: string | null
          status?: string
          transaction_type?: string
          updated_at?: string
          usd_equivalent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_destination_wallet_id_fkey"
            columns: ["destination_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_source_wallet_id_fkey"
            columns: ["source_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_insurance_policies: {
        Row: {
          add_ons: Json | null
          claim_details: Json | null
          claim_status: string | null
          coverage_details: Json | null
          created_at: string
          destination_country: string
          disclaimer_accepted: boolean | null
          disclaimer_accepted_at: string | null
          facilitator_fee: number | null
          has_claim: boolean | null
          id: string
          insurer_issued_at: string | null
          issued_at: string | null
          number_of_travellers: number
          paid_at: string | null
          partner_insurer_name: string | null
          partner_policy_reference: string | null
          payment_method: string | null
          payment_status: string
          payment_transaction_id: string | null
          plan_type: string
          policy_number: string
          policy_status: string
          premium_amount: number
          selected_plan: string
          travel_end_date: string
          travel_start_date: string
          travellers: Json
          trip_duration: number
          updated_at: string
          user_id: string
        }
        Insert: {
          add_ons?: Json | null
          claim_details?: Json | null
          claim_status?: string | null
          coverage_details?: Json | null
          created_at?: string
          destination_country: string
          disclaimer_accepted?: boolean | null
          disclaimer_accepted_at?: string | null
          facilitator_fee?: number | null
          has_claim?: boolean | null
          id?: string
          insurer_issued_at?: string | null
          issued_at?: string | null
          number_of_travellers?: number
          paid_at?: string | null
          partner_insurer_name?: string | null
          partner_policy_reference?: string | null
          payment_method?: string | null
          payment_status?: string
          payment_transaction_id?: string | null
          plan_type: string
          policy_number: string
          policy_status?: string
          premium_amount: number
          selected_plan: string
          travel_end_date: string
          travel_start_date: string
          travellers?: Json
          trip_duration: number
          updated_at?: string
          user_id: string
        }
        Update: {
          add_ons?: Json | null
          claim_details?: Json | null
          claim_status?: string | null
          coverage_details?: Json | null
          created_at?: string
          destination_country?: string
          disclaimer_accepted?: boolean | null
          disclaimer_accepted_at?: string | null
          facilitator_fee?: number | null
          has_claim?: boolean | null
          id?: string
          insurer_issued_at?: string | null
          issued_at?: string | null
          number_of_travellers?: number
          paid_at?: string | null
          partner_insurer_name?: string | null
          partner_policy_reference?: string | null
          payment_method?: string | null
          payment_status?: string
          payment_transaction_id?: string | null
          plan_type?: string
          policy_number?: string
          policy_status?: string
          premium_amount?: number
          selected_plan?: string
          travel_end_date?: string
          travel_start_date?: string
          travellers?: Json
          trip_duration?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_service_intents: {
        Row: {
          created_at: string
          id: string
          last_activity_at: string | null
          service_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_activity_at?: string | null
          service_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_activity_at?: string | null
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          available_balance: number
          balance: number
          created_at: string
          currency: string
          held_balance: number
          id: string
          is_active: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number
          balance?: number
          created_at?: string
          currency: string
          held_balance?: number
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number
          balance?: number
          created_at?: string
          currency?: string
          held_balance?: number
          id?: string
          is_active?: boolean | null
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
      admin_approve_exchange_order: {
        Args: { _order_id: string }
        Returns: Json
      }
      admin_approve_remittance: {
        Args: { _transaction_id: string }
        Returns: Json
      }
      admin_complete_transaction: {
        Args: { _transaction_id: string }
        Returns: Json
      }
      admin_confirm_payin: { Args: { _transaction_id: string }; Returns: Json }
      admin_confirm_payment: {
        Args: { _transaction_id: string }
        Returns: Json
      }
      admin_dispatch_transaction: {
        Args: { _transaction_id: string }
        Returns: Json
      }
      admin_reject_exchange_order: {
        Args: { _order_id: string; _reason?: string }
        Returns: Json
      }
      admin_reject_payment: {
        Args: { _reason?: string; _transaction_id: string }
        Returns: Json
      }
      check_kyc_verified: { Args: { _user_id: string }; Returns: boolean }
      credit_refundable_balance: {
        Args: {
          _amount: number
          _description?: string
          _reason: string
          _source_id?: string
          _source_reference?: string
          _source_type?: string
          _user_id: string
        }
        Returns: Json
      }
      debit_refundable_balance: {
        Args: {
          _amount: number
          _description?: string
          _reason: string
          _source_id?: string
          _source_type?: string
          _user_id: string
        }
        Returns: Json
      }
      get_current_financial_year: { Args: never; Returns: string }
      get_lrs_usage: {
        Args: { _financial_year?: string; _user_id: string }
        Returns: {
          remaining_limit: number
          total_used: number
          transaction_count: number
          usage_percentage: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_email: { Args: never; Returns: boolean }
      log_compliance_event: {
        Args: {
          _action_type: string
          _admin_user_id?: string
          _details?: Json
          _entity_id: string
          _entity_type: string
          _user_id: string
        }
        Returns: string
      }
      process_bank_refund: {
        Args: { _refund_request_id: string }
        Returns: Json
      }
      process_currency_exchange: {
        Args: {
          _exchange_rate: number
          _from_amount: number
          _from_wallet_id: string
          _spread_cost: number
          _to_amount: number
          _to_wallet_id: string
        }
        Returns: Json
      }
      process_payin: {
        Args: {
          _amount: number
          _bank_name: string
          _currency: string
          _reference_code: string
          _wallet_id: string
        }
        Returns: Json
      }
      process_payout: {
        Args: {
          _amount: number
          _beneficiary_id: string
          _destination_amount: number
          _destination_currency: string
          _exchange_rate?: number
          _fee: number
          _source_wallet_id: string
        }
        Returns: Json
      }
      process_wallet_deposit: {
        Args: { _amount: number; _payment_method: string; _wallet_id: string }
        Returns: Json
      }
      process_wallet_transfer: {
        Args: {
          _amount: number
          _beneficiary_id?: string
          _destination_amount: number
          _destination_currency: string
          _exchange_rate: number
          _fee: number
          _notes?: string
          _purpose?: string
          _source_wallet_id: string
        }
        Returns: Json
      }
      request_transaction_cancellation: {
        Args: { _reason: string; _transaction_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "forex_admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
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
      app_role: ["admin", "moderator", "user", "forex_admin"],
    },
  },
} as const
